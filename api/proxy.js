
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
  // 1. CORS & Security Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  const allowedOrigins = ['https://manapalm.com', 'http://localhost:3000', 'https://nakhlestan-mana.com'];
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

  // 2. Referer Check (Basic Protection)
  const referer = req.headers.referer || req.headers.origin;
  if (!referer || !allowedOrigins.some(url => referer.startsWith(url))) {
      // In production, uncomment this line to block external requests
      // return res.status(403).json({ error: 'Unauthorized request source' });
  }

  try {
    const { action, model, data, provider } = req.body;

    // 3. Validation
    if (model && !ALLOWED_MODELS.includes(model)) {
      return res.status(403).json({ error: 'Model not authorized' });
    }
    
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

      // Force Safety Settings on Server Side
      config = {
          ...config,
          safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
      };

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
        const operation = await ai.models.generateVideos({
            model: model,
            prompt: data.prompt,
            image: data.image,
            config: data.config
        });
        result = { operation };
        
    } else if (action === 'getVideosOperation') {
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
