import { GoogleGenerativeAI } from '@google/generative-ai';

// Allowed models whitelist
const ALLOWED_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-pro-vision'
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

  try {
    const { action, model, data } = req.body;
    let targetModel = model || 'gemini-2.5-flash-lite';

    // Map new experimental model names to stable ones if needed, or keep as is if supported
    // Removed override to allow 2.5 usage
    /*
    if (targetModel.includes('gemini-2.5') || targetModel.includes('gemini-3')) {
      targetModel = 'gemini-1.5-pro'; // Fallback to stable for now to ensure reliability
    }
    */

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      console.error('API Key missing on server');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    if (action === 'generateContent') {
      const modelInstance = genAI.getGenerativeModel({
        model: targetModel,
        safetySettings: data.config?.safetySettings,
        generationConfig: data.config
      });

      // Convert "contents" format if needed, but SDK usually handles standard format
      // Standard SDK expects "contents" array in generateContent
      const result = await modelInstance.generateContent({
        contents: data.contents,
      });

      const response = await result.response;
      const text = response.text();

      return res.status(200).json({
        text: text,
        candidates: response.candidates
      });

    } else {
      // For other actions like image generation, currently using standard REST fallback or disabling
      // The Node SDK focuses on text/multimodal content. 
      // Image generation (Imagen) typically requires Vertex AI SDK or REST.
      return res.status(400).json({ error: 'Action not supported in stable SDK migration yet' });
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal AI Service Error' });
  }
}
