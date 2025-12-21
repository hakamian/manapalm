// Simple curl-like test
const testSimple = async () => {
    console.log('🧪 Simple test...\n');

    try {
        const response = await fetch('http://localhost:3000/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'سلام' }]
                    }]
                }
            })
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));

        const text = await response.text();
        console.log('Raw Response:', text.substring(0, 500));

        if (text) {
            try {
                const json = JSON.parse(text);
                console.log('\n✅ Parsed JSON:', JSON.stringify(json, null, 2));
            } catch (e) {
                console.log('\n⚠️ Could not parse as JSON');
            }
        }
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }
};

testSimple();
