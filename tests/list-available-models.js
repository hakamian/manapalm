// List available Gemini models
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyCtTfiS2C9wFSrt0ZoHklmPSm70pa8WYUk';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    console.log('🔍 Fetching available Gemini models...\n');

    try {
        const models = await genAI.listModels();

        console.log('✅ Available Models:\n');
        models.forEach((model, index) => {
            console.log(`${index + 1}. ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listModels();
