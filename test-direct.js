
import dotenv from 'dotenv';
dotenv.config();

// Native fetch Node 24+ config
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash';

console.log(`Using Key: ${API_KEY ? API_KEY.substring(0, 5) + '...' : 'UNDEFINED'}`);

async function testDirect() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    console.log(`POST to ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello AI" }]
                }]
            })
        });

        if (!response.ok) {
            const txt = await response.text();
            console.error(`Error ${response.status}: ${txt}`);
        } else {
            const data = await response.json();
            console.log("Success!");
            console.log(JSON.stringify(data.candidates?.[0]?.content?.parts?.[0]?.text, null, 2));
        }

    } catch (error) {
        console.error("Direct Fetch Error:", error);
    }
}

testDirect();
