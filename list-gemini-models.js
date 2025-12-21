// List available models from Gemini API
const apiKey = 'AIzaSyCtTfiS2C9wFSrt0ZoHklmPSm70pa8WYUk';

async function listAvailableModels() {
    console.log('🔍 Fetching list of available Gemini models...\n');

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.models) {
            console.log(`✅ Found ${data.models.length} models:\n`);

            data.models.forEach((model, index) => {
                console.log(`${index + 1}. ${model.name}`);
                console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });

            // Find models that support generateContent
            const contentModels = data.models.filter(m =>
                m.supportedGenerationMethods?.includes('generateContent')
            );

            console.log('\n📝 Models that support generateContent:');
            contentModels.forEach(m => {
                console.log(`   - ${m.name}`);
            });

        } else {
            console.log('❌ FAILED!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log(error.message);
    }
}

listAvailableModels();
