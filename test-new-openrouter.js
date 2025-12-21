// Test new OpenRouter API Key
const testNewOpenRouterKey = async () => {
    console.log('🧪 Testing NEW OpenRouter API Key...\n');

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
                    content: 'سلام! این یک تست برای API Key جدید است. لطفاً با یک جمله کوتاه پاسخ بده.'
                }]
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.choices) {
            console.log('\n✅ SUCCESS! OpenRouter API Key is VALID!\n');
            console.log('AI Response:', data.choices[0].message.content);
            console.log('\n🎉 You can now use OpenRouter for FREE AI services!');
        } else {
            console.log('\n❌ FAILED!');
            if (data.error) {
                console.log('Error:', data.error);
            }
        }
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log(error.message);
    }
};

testNewOpenRouterKey();
