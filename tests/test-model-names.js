// Test different Gemini model names
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyCtTfiS2C9wFSrt0ZoHklmPSm70pa8WYUk';
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash'
];

async function testModels() {
    console.log('🧪 Testing different Gemini model names...\n');

    for (const modelName of modelsToTest) {
        console.log(`Testing: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('سلام');
            const response = await result.response;
            const text = response.text();

            console.log(`✅ SUCCESS with ${modelName}`);
            console.log(`Response: ${text}\n`);
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ Failed: ${error.message}\n`);
        }
    }
}

testModels();
