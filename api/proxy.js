
import { GoogleGenAI } from '@google/genai';

// Allowed models whitelist
const ALLOWED_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-pro-preview',
  'imagen-4.0-generate-001',
  'veo-3.1-fast-generate-preview',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-flash-native-audio-preview-09-2025',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet'
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, model, data, provider } = req.body;

    // Security Check: Validate Model (Skip for operations which might not send model)
    if (model && !ALLOWED_MODELS.includes(model)) {
      return res.status(403).json({ error: 'Model not authorized' });
    }
    
    // Fallback to the provided key if env var is not set
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      console.error('API Key missing on server');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });
    let result;

    // --- ACTION HANDLERS ---

    if (action === 'generateContent') {
      let contents = data.contents;
      let config = data.config;

      // Simulation Logic for Demo Providers
      if (provider === 'openai') {
          config = { ...config, systemInstruction: (config?.systemInstruction || '') + "\n[SYSTEM NOTICE: You are simulating GPT-4o behavior. Be concise, analytical, and use structured reasoning.]" };
      } else if (provider === 'anthropic') {
          config = { ...config, systemInstruction: (config?.systemInstruction || '') + "\n[SYSTEM NOTICE: You are simulating Claude 3.5 Sonnet behavior. Be nuanced, articulate, and prioritize safety and ethics.]" };
      }

      const actualModel = (model.startsWith('gpt') || model.startsWith('claude')) ? 'gemini-3-pro-preview' : model;

      const response = await ai.models.generateContent({
        model: actualModel,
        contents: contents,
        config: config
      });
      
      result = {
        text: response.text,
        candidates: response.candidates,
        functionCalls: response.functionCalls
      };
      
    } else if (action === 'generateImages') {
       const response = await ai.models.generateImages({
         model: model,
         prompt: data.prompt,
         config: data.config
       });
       
       if (response.generatedImages) {
           result = {
               images: response.generatedImages.map(img => img.image.imageBytes)
           };
       }
    } else if (action === 'generateVideos') {
        // Video generation returns an Operation object
        const operation = await ai.models.generateVideos({
            model: model,
            prompt: data.prompt,
            image: data.image,
            config: data.config
        });
        // We return the operation metadata so client can poll
        result = { operation };
        
    } else if (action === 'getVideosOperation') {
        // Polling for video status
        const operation = await ai.operations.getVideosOperation({
            name: data.operationName 
        });
        result = { operation };
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal AI Service Error' });
  }
}
