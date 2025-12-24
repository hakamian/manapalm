import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const GEMINI_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

// Initialize Supabase Client (For server-side user verification)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Only if you have it in Vercel for bypassing RLS

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (i > 0) await delay(1000 * Math.pow(2, i));
      const response = await fetch(url, options);
      if (response.status === 429 && i < maxRetries) continue;
      return response;
    } catch (error) {
      lastError = error;
      if (i < maxRetries) continue;
    }
  }
  throw lastError || new Error('Fetch failed after retries');
}

export default async function handler(req, res) {
  // 1. CORS & Security
  res.setHeader('Access-Control-Allow-Credentials', true);
  const allowedOrigins = ['https://manapalm.com', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://nakhlestan-mana.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, model, data, provider } = req.body;
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'];

    let userTier = 'free';
    let remainingSeconds = 0;
    let userId = userIdHeader;

    // 2. IDENTITY & QUOTA CHECK
    if (authHeader) {
      // Extract Token (Bearer ...)
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        userId = user.id;
        // Fetch remaining seconds from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('metadata, is_admin')
          .eq('id', user.id)
          .single();

        if (profile) {
          const metadata = profile.metadata || {};
          remainingSeconds = metadata.hoshmanaLiveAccess?.remainingSeconds || 0;
          if (profile.is_admin || remainingSeconds > 0) {
            userTier = 'premium';
          }
        }
      }
    }

    // 3. PROVIDER SELECTION STRATEGY
    let activeProvider = provider || (userTier === 'premium' ? 'openai' : 'openrouter');
    let targetModel = model;

    if (activeProvider === 'openai' && !targetModel) targetModel = 'gpt-4o-mini';
    if (activeProvider === 'openrouter' && !targetModel) targetModel = 'mistralai/devstral-2512:free';
    if (activeProvider === 'google' && !targetModel) targetModel = 'gemini-2.0-flash-exp';

    let resultText = null;

    // --- PROVIDER HANDLERS ---

    const tryOpenAI = async (m) => {
      const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY || process.env.OPENAI_API_KEY });

      // Convert contents to OpenAI format
      const messages = (data?.contents || []).map(c => ({
        role: c.role === 'model' ? 'assistant' : 'user',
        content: typeof c.parts?.[0]?.text === 'string' ? c.parts[0].text : JSON.stringify(c.parts?.[0] || {})
      }));

      if (data?.config?.systemInstruction) {
        messages.unshift({ role: 'system', content: data.config.systemInstruction });
      }

      const completion = await openai.chat.completions.create({
        model: m,
        messages: messages,
        temperature: data?.config?.temperature || 0.7,
      });

      // TODO: Deduct seconds from Supabase here (Optional: do it background/post-response)
      return completion.choices?.[0]?.message?.content || '';
    };

    const tryOpenRouter = async (m) => {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const messages = (data?.contents || []).map(c => ({
        role: c.role === 'model' ? 'assistant' : 'user',
        content: typeof c.parts?.[0]?.text === 'string' ? c.parts[0].text : JSON.stringify(c.parts?.[0] || {})
      }));

      const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: m,
          messages: messages,
          temperature: data?.config?.temperature || 0.7,
        })
      });

      const resData = await response.json();
      return resData.choices?.[0]?.message?.content || '';
    };

    const tryGemini = async (m) => {
      const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAm0R_nTy51zh09seInVwYE0IY8He29VYY"; // Local/Production key
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelInstance = genAI.getGenerativeModel({ model: m || 'gemini-1.5-flash' });
      const result = await modelInstance.generateContent({ contents: data?.contents || [] });
      const response = await result.response;
      return response.text();
    };

    // 4. EXECUTION
    try {
      if (activeProvider === 'openai') {
        resultText = await tryOpenAI(targetModel);
      } else if (activeProvider === 'google') {
        resultText = await tryGemini(targetModel);
      } else {
        resultText = await tryOpenRouter(targetModel);
      }
    } catch (err) {
      console.error(`Provider ${activeProvider} failed:`, err.message);
      // Fallback to Free OpenRouter if premium fails
      if (activeProvider !== 'openrouter') {
        resultText = await tryOpenRouter('mistralai/devstral-2512:free');
        activeProvider = 'openrouter (fallback)';
      } else {
        throw err;
      }
    }

    return res.status(200).json({
      text: resultText,
      provider: activeProvider,
      tier: userTier,
      remainingSeconds
    });

  } catch (error) {
    console.error('Final Proxy Error:', error);
    return res.status(500).json({
      error: error.message || 'AI Service Error',
      suggestion: 'خطا در ارتباط با هوش مصنوعی. لطفا لحظاتی دیگر تلاش کنید.'
    });
  }
}
