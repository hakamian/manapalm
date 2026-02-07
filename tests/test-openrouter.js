
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

console.log("🔍 Testing OpenRouter API Key...");
console.log("Key prefix:", OPENROUTER_KEY?.substring(0, 15) + "...");

async function testOpenRouter() {
    if (!OPENROUTER_KEY) {
        console.error("❌ OPENROUTER_API_KEY is missing!");
        return;
    }

    // 1. Test a simple request to list models
    console.log("\n📋 Fetching available models from OpenRouter...");
    try {
        const modelsResponse = await fetch("https://openrouter.ai/api/v1/models", {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!modelsResponse.ok) {
            console.error("❌ Failed to fetch models:", modelsResponse.status, await modelsResponse.text());
            return;
        }

        const modelsData = await modelsResponse.json();

        // Filter for free models
        const freeModels = modelsData.data?.filter(m =>
            m.id.includes(':free') ||
            (m.pricing?.prompt === "0" && m.pricing?.completion === "0")
        ) || [];

        console.log(`✅ Found ${freeModels.length} free models:`);
        freeModels.slice(0, 10).forEach(m => console.log(`  - ${m.id}`));

        if (freeModels.length > 0) {
            // 2. Test a simple generation with the first free model
            const testModel = freeModels[0].id;
            console.log(`\n🤖 Testing generation with: ${testModel}`);

            const genResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_KEY}`,
                    "HTTP-Referer": "https://manapalm.com",
                    "X-Title": "Nakhlestan Mana Test",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: testModel,
                    messages: [{ role: "user", content: "Say 'OpenRouter OK' in 2 words." }],
                    max_tokens: 10
                })
            });

            if (!genResponse.ok) {
                const errorText = await genResponse.text();
                console.error(`❌ Generation failed (${genResponse.status}):`, errorText);
            } else {
                const genData = await genResponse.json();
                console.log("✅ Response:", genData.choices?.[0]?.message?.content);
            }
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testOpenRouter();
