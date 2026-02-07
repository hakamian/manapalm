// Final test with correct model name
const testFinal = async () => {
    console.log('🧪 Testing with correct Gemini model name...\n');

    try {
        const response = await fetch('http://localhost:3000/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'generateContent',
                model: 'models/gemini-2.0-flash',
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

        if (response.ok && data.text) {
            console.log('\n✅ SUCCESS! AI is working!\n');
            console.log(`Provider: ${data.provider}`);
            console.log(`Model: ${data.model}`);
            console.log(`Fallback Used: ${data.isFallback ? 'Yes' : 'No'}`);
            console.log(`\nAI Response: ${data.text}`);
        } else {
            console.log('\n❌ FAILED!');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log(error.message);
    }
};

testFinal();
