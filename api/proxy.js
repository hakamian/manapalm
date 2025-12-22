import { GoogleGenerativeAI } from '@google/generative-ai';

// Allowed models whitelist for Gemini
const GEMINI_MODELS = [
  'gemini-2.1-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-pro-vision'
];


// Helper for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for fetching with retry and timeout
async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (i > 0) await delay(1000 * Math.pow(2, i)); // Exponential backoff
      const response = await fetch(url, options);

      // If we get a 429 (Rate Limit), we only retry if we haven't exhausted retries
      if (response.status === 429 && i < maxRetries) {
        console.warn(`Rate limited (429). Retry attempt ${i + 1}...`);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (i < maxRetries) continue;
    }
  }
  throw lastError || new Error('Fetch failed after retries');
}

export default async function handler(req, res) {
  // 1. CORS & Security Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  const allowedOrigins = ['https://manapalm.com', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://nakhlestan-mana.com'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, model, data, provider } = req.body;
    // Using Mistral Devstral - TESTED with good Persian support
    let targetModel = model || 'mistralai/devstral-2512:free';

    // Determine initial provider - FORCE OPENROUTER since Google has 0 quota
    let activeProvider = 'openrouter';
    // let activeProvider = provider || (targetModel.includes('/') ? 'openrouter' : 'google');

    // ---------------------------------------------------------
    // STRATEGY: TRY PRIMARY PROVIDER -> IF 429 -> TRY SECONDARY
    // ---------------------------------------------------------

    let resultText = null;
    let finalProvider = activeProvider;
    let finalModel = targetModel;

    const tryOpenRouter = async (m) => {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) throw new Error('OpenRouter Key Missing');

      // Construct Messages
      let messages = [];

      // Add System Prompt if exists
      if (data.config && data.config.systemInstruction) {
        messages.push({ role: "system", content: data.config.systemInstruction });
      }

      // Add Conversation History
      const userMessages = data.contents.map(c => ({
        role: c.role === 'model' ? 'assistant' : c.role,
        content: typeof c.parts[0].text === 'string' ? c.parts[0].text : JSON.stringify(c.parts[0])
      }));

      messages = messages.concat(userMessages);

      const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://manapalm.com",
          "X-Title": "Nakhlestan Mana",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": m,
          "messages": messages,
          "temperature": data.config?.temperature || 0.7,
        })
      });

      if (response.status === 429) throw { status: 429, message: 'OpenRouter Rate Limit' };
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error.message || 'OpenRouter Error');
      return resData.choices[0].message.content;
    };

    const tryGemini = async (m) => {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) throw new Error('Gemini Key Missing');

      const genAI = new GoogleGenerativeAI(apiKey);
      // Note: SDK doesn't natively support easy retry on 429 without custom wrapper
      // but we can wrap the call
      let lastErr;
      for (let i = 0; i < 2; i++) {
        try {
          // FORCE OVERRIDE: Always use the working experimental model for now
          // This ignores whatever the frontend asked for (e.g. 1.5-flash) to prevent 404s
          const modelToUse = 'gemini-2.0-flash-exp';
          const modelInstance = genAI.getGenerativeModel({ model: modelToUse });
          const result = await modelInstance.generateContent({ contents: data.contents });
          const response = await result.response;
          return response.text();
        } catch (err) {
          lastErr = err;
          if (err.message?.includes('429') && i < 1) {
            await delay(2000);
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    };

    // EXECUTION WITH FALLBACK
    try {
      if (activeProvider === 'openrouter') {
        resultText = await tryOpenRouter(targetModel);
      } else {
        resultText = await tryGemini(targetModel);
      }
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429')) {
        console.warn("Primary Provider Rate Limited.");
        // We are disabling fallback to Google because the user's Google account has 0 quota.
        // It's better to fail with the OpenRouter error so we can debug it.
        throw err;
      } else {
        throw err;
      }
    }

    return res.status(200).json({
      text: resultText,
      provider: finalProvider,
      model: finalModel,
      isFallback: finalProvider !== activeProvider
    });

  } catch (error) {
    console.error('Final Proxy Error:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'AI Service Exhausted',
      suggestion: 'سیستم در حال حاضر بیش از حد مشغول است. لطفا ۶۰ ثانیه دیگر تلاش کنید.'
    });
  }
}
