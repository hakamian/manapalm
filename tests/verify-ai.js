
// Using native fetch in Node 24+

async function testProxy() {
    console.log("Testing AI Proxy at http://localhost:3001/api/proxy...");

    try {
        const response = await fetch('http://localhost:3001/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'generateContent',
                model: 'gemini-2.5-flash-lite',
                data: {
                    contents: [{
                        role: 'user',
                        parts: [{ text: 'Hello, are you working?' }]
                    }]
                }
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Error ${response.status}: ${text}`);
            process.exit(1);
        }

        const data = await response.json();
        console.log("Success! Response from AI:");
        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

testProxy();
