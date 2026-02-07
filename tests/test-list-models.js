
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    console.log("Listing models...");

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Listing Error:", data.error);
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("No models returned (empty list).");
            }
        }

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

listModels();
