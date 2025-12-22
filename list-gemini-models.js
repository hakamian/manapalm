
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function listModels() {
    if (!key) {
        console.error("API Key missing");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Fetching available models...");
        // Use the model manager to list models
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // Note: The SDK doesn't expose listModels directly on the main instance in all versions, 
        // but let's try a direct fetch if the SDK method isn't obvious, 
        // strictly speaking usually it's passed to the constructor or via a specific manager.
        // Actually, let's try a simple REST call to be sure, avoiding SDK version quirks.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(` - ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.error("❌ Failed to list models:", data);
        }

    } catch (error) {
        console.error("❌ Error listing models:", error.message);
    }
}

listModels();
