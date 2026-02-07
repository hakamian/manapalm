// Test production site
const testProduction = async () => {
    console.log('🧪 Testing Production Site (manapalm.com)...\n');

    try {
        const response = await fetch('https://manapalm.com/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'generateContent',
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'سلام! این یک تست است.' }]
                    }],
                    config: { temperature: 0.7 }
                }
            })
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        const text = await response.text();

        if (text) {
            try {
                const json = JSON.parse(text);
                console.log('\n✅ SUCCESS! AI is working on production!\n');
                console.log('Provider:', json.provider);
                console.log('Model:', json.model);
                console.log('Response:', json.text?.substring(0, 100) + '...');
            } catch (e) {
                console.log('\n⚠️ Response:', text.substring(0, 500));
            }
        }
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }
};

testProduction();
