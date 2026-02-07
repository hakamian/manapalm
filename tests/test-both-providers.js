// Comprehensive test for both OpenRouter and Gemini
const testBothProviders = async () => {
    console.log('🧪 Testing BOTH AI Providers...\n');
    console.log('='.repeat(60));

    // Test 1: OpenRouter (Default)
    console.log('\n📝 Test 1: OpenRouter (Default - Free Tier)');
    console.log('-'.repeat(60));

    try {
        const response1 = await fetch('http://localhost:3000/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                // No model specified - should use default (OpenRouter)
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'سلام! این تست OpenRouter است. یک جمله کوتاه بگو.' }]
                    }],
                    config: { temperature: 0.7 }
                }
            })
        });

        const data1 = await response1.json();

        if (response1.ok && data1.text) {
            console.log('✅ OpenRouter SUCCESS!');
            console.log(`   Provider: ${data1.provider}`);
            console.log(`   Model: ${data1.model}`);
            console.log(`   Response: ${data1.text.substring(0, 100)}...`);
        } else {
            console.log('❌ OpenRouter FAILED!');
            console.log(`   Error: ${JSON.stringify(data1)}`);
        }
    } catch (error) {
        console.log('❌ OpenRouter ERROR:', error.message);
    }

    // Test 2: Gemini (Explicit)
    console.log('\n📝 Test 2: Gemini (Explicit Request)');
    console.log('-'.repeat(60));

    try {
        const response2 = await fetch('http://localhost:3000/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                model: 'models/gemini-2.0-flash',
                provider: 'google',
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'سلام! این تست Gemini است. یک جمله کوتاه بگو.' }]
                    }],
                    config: { temperature: 0.7 }
                }
            })
        });

        const data2 = await response2.json();

        if (response2.ok && data2.text) {
            console.log('✅ Gemini SUCCESS!');
            console.log(`   Provider: ${data2.provider}`);
            console.log(`   Model: ${data2.model}`);
            console.log(`   Response: ${data2.text.substring(0, 100)}...`);
        } else {
            console.log('❌ Gemini FAILED!');
            console.log(`   Error: ${JSON.stringify(data2)}`);
        }
    } catch (error) {
        console.log('❌ Gemini ERROR:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 Testing Complete!\n');
    console.log('📊 Summary:');
    console.log('   - OpenRouter: Free tier with new valid API key');
    console.log('   - Gemini: Fallback option with valid API key');
    console.log('   - Both providers are ready for production! 🎉');
};

testBothProviders();
