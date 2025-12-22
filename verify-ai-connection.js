
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

console.log("🔍 Checking Environment Variables...");
const key = process.env.GEMINI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

if (key) {
    console.log("✅ GEMINI_API_KEY found: " + key.substring(0, 8) + "...");
} else {
    console.error("❌ GEMINI_API_KEY is missing!");
}

if (openRouterKey) {
    console.log("✅ OPENROUTER_API_KEY found: " + openRouterKey.substring(0, 8) + "...");
} else {
    console.error("❌ OPENROUTER_API_KEY is missing!");
}

async function testGemini() {
    if (!key) return;

    console.log("\n🤖 Testing Gemini Connection...");
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("   Sending request...");
        const result = await model.generateContent("Hello, strictly reply with 'Gemini OK'.");
        const response = await result.response;
        console.log("✅ Gemini Response:", response.text());
    } catch (error) {
        console.error("❌ Gemini Connection Failed:", error.message);
    }
}

testGemini();
