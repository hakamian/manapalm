
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// NOTE: In production, use process.env.CLOUDINARY_URL or individual keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME_PLACEHOLDER',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY_PLACEHOLDER',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET_PLACEHOLDER',
  secure: true
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, folder = 'manapalm_auto_gen' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing AI Key' });
  }

  try {
    // 1. Generate Image using Google GenAI (Imagen)
    const ai = new GoogleGenAI({ apiKey });
    console.log(`Agent: Generating image for prompt: "${prompt.substring(0, 50)}..."`);
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Photorealistic, high quality, 8k, cinematic lighting: ${prompt}`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9'
      }
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('AI failed to generate image');
    }

    const imageBase64 = response.generatedImages[0].image.imageBytes;

    // 2. Direct Upload to Cloudinary (Zero-Click)
    console.log('Agent: Uploading directly to Cloudinary...');
    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${imageBase64}`,
        {
          folder: folder,
          resource_type: 'image',
          public_id: `ai_gen_${Date.now()}`,
          transformation: [
             { quality: 'auto', fetch_format: 'auto' } // Optimization on upload
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // 3. Return the Optimized URL
    // We append specific transformation flags to ensure it's always optimized when used
    const optimizedUrl = uploadResult.secure_url;
    
    console.log('Agent: Success! Asset URL:', optimizedUrl);

    return res.status(200).json({ 
      success: true, 
      url: optimizedUrl,
      public_id: uploadResult.public_id,
      details: uploadResult
    });

  } catch (error) {
    console.error('Agent Asset Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Agent Error' });
  }
}
