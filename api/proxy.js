
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. Handle CORS for direct Vercel calls if needed
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, model, data } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Missing API Key in server environment.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        let targetModel = model || 'gemini-1.5-flash';

        // Handle newer experimental models or aliases
        if (targetModel.includes('gemini-2.5') || targetModel.includes('gemini-3')) {
            targetModel = 'gemini-1.5-pro';
        }

        if (action === 'generateContent') {
            const modelInstance = genAI.getGenerativeModel({
                model: targetModel,
                generationConfig: data.config
            });

            const result = await modelInstance.generateContent({
                contents: data.contents
            });

            const response = await result.response;
            const text = response.text();

            return res.status(200).json({
                text: text,
                candidates: response.candidates,
                success: true
            });
        } else if (action === 'generateImages') {
            // Placeholder for Imagen/DALL-E if needed
            return res.status(501).json({ error: 'Image generation via proxy not implemented yet.' });
        } else {
            return res.status(400).json({ error: `Unsupported action: ${action}` });
        }
    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: error.message || 'Internal AI Proxy Error' });
    }
}
