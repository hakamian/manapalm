// Test script for AI API
const testAPI = async () => {
    console.log('🧪 Testing AI API...\n');

    const tests = [
        {
            name: 'Test 1: OpenRouter API',
            payload: {
                action: 'generateContent',
                model: 'google/gemini-2.0-flash-exp:free',
                provider: 'openrouter',
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'سلام! فقط یک تست ساده است. لطفاً با یک جمله کوتاه پاسخ بده.' }]
                    }],
                    config: { temperature: 0.7 }
                }
            }
        },
        {
            name: 'Test 2: Gemini API',
            payload: {
                action: 'generateContent',
                model: 'gemini-1.5-flash',
                provider: 'google',
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'سلام! فقط یک تست ساده است. لطفاً با یک جمله کوتاه پاسخ بده.' }]
                    }],
                    config: { temperature: 0.7 }
                }
            }
        }
    ];

    for (const test of tests) {
        console.log(`\n📝 ${test.name}`);
        console.log('─'.repeat(50));

        try {
            const response = await fetch('http://localhost:3000/api/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(test.payload)
            });

            const data = await response.json();

            if (response.ok && data.text) {
                console.log('✅ SUCCESS!');
                console.log(`Provider: ${data.provider}`);
                console.log(`Model: ${data.model}`);
                console.log(`Fallback Used: ${data.isFallback ? 'Yes' : 'No'}`);
                console.log(`Response: ${data.text}`);
            } else {
                console.log('❌ FAILED!');
                console.log(`Status: ${response.status}`);
                console.log(`Error: ${JSON.stringify(data, null, 2)}`);
            }
        } catch (error) {
            console.log('❌ ERROR!');
            console.log(error.message);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Testing Complete!');
};

testAPI();
