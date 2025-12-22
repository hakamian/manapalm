
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const modelsToTest = [
    'tngtech/tng-r1t-chimera:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'xiaomi/mimo-v2-flash:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'allenai/olmo-3.1-32b-think:free',
    'mistralai/devstral-2512:free'
];

async function testModel(modelId) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_KEY}`,
                "HTTP-Referer": "https://manapalm.com",
                "X-Title": "Nakhlestan Mana Test",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: "user", content: "سلام! یک جمله کوتاه به فارسی بگو." }],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { model: modelId, status: 'FAIL', error: `${response.status}: ${errorText.substring(0, 100)}` };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        return { model: modelId, status: 'OK', response: content.substring(0, 80) };

    } catch (error) {
        return { model: modelId, status: 'ERROR', error: error.message };
    }
}

async function main() {
    console.log("🧪 Testing multiple OpenRouter models...\n");

    for (const model of modelsToTest) {
        console.log(`Testing: ${model}`);
        const result = await testModel(model);

        if (result.status === 'OK') {
            console.log(`  ✅ ${result.status}: "${result.response}..."`);
        } else {
            console.log(`  ❌ ${result.status}: ${result.error}`);
        }
        console.log('');
    }
}

main();
