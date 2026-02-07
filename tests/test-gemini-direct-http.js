// Direct HTTP test to Gemini API
// Using built-in fetch (Node.js 18+)

const apiKey = 'AIzaSyCtTfiS2C9wFSrt0ZoHklmPSm70pa8WYUk';

async function testGeminiDirect() {
    console.log('🧪 Testing Gemini API with direct HTTP request...\n');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'سلام! این یک تست است.'
                    }]
                }]
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ SUCCESS!');
            console.log('Text:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('\n❌ FAILED!');
            if (data.error) {
                console.log('Error Code:', data.error.code);
                console.log('Error Message:', data.error.message);
                console.log('Error Status:', data.error.status);
            }
        }
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log(error.message);
    }
}

testGeminiDirect();
