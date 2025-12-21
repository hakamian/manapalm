// Direct OpenRouter Test
const testOpenRouterDirect = async () => {
    console.log('🧪 Testing OpenRouter API Directly...\n');

    const apiKey = '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';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://manapalm.com',
                'X-Title': 'Nakhlestan Mana',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{
                    role: 'user',
                    content: 'سلام! این یک تست است.'
                }]
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ SUCCESS!');
            console.log('AI Response:', data.choices[0].message.content);
        } else {
            console.log('\n❌ FAILED!');
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log(error.message);
    }
};

testOpenRouterDirect();
