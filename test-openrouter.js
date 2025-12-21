import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemini-2.0-flash-exp:free';

async function testOpenRouter() {
    console.log("🚀 Testing OpenRouter Integration...");

    if (!OPENROUTER_API_KEY) {
        console.error("❌ Error: OPENROUTER_API_KEY not found in .env");
        return;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [
                    { role: "user", content: "سلام، اگر این پیام را دریافت می‌کنی یعنی اتصال OpenRouter برقرار است. یک جمله کوتاه درباره نخلستان بگو." }
                ]
            })
        });

        const result = await response.json();

        if (result.error) {
            console.error("❌ OpenRouter Error:", result.error);
        } else {
            console.log("✅ Success! Response:");
            console.log(result.choices[0].message.content);
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error.message);
    }
}

testOpenRouter();
