// Test Gemini API
const testGemini = async () => {
    console.log('🧪 Testing Gemini API...\n');

    try {
        const response = await fetch('http://localhost:3000/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.text) {
            console.log('\n✅ SUCCESS!');
            console.log(`Provider: ${data.provider}`);
            console.log(`Model: ${data.model}`);
            console.log(`AI Response: ${data.text}`);
        } else {
            console.log('\n❌ FAILED!');
        }
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log(error.message);
    }
};

testGemini();
