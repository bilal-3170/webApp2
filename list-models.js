// Script to list all available Gemini models for your API key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
    try {
        console.log('Fetching list of available models...\n');
        console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 20) + '...\n');
        
        // Use the listModels method from the SDK
        const models = await genAI.listModels();
        
        console.log('Available Models:\n');
        console.log('='.repeat(80));
        
        for await (const model of models) {
            console.log('\n Model Name:', model.name);
            console.log('  Display Name:', model.displayName);
            console.log('  Description:', model.description);
            console.log('  Supported Methods:', model.supportedGenerationMethods?.join(', '));
            console.log('-'.repeat(80));
        }
        
    } catch (error) {
        console.error('\n❌ Error listing models:');
        console.error('Message:', error.message);
        console.error('\nThis might mean:');
        console.log('1. The API key is invalid');
        console.log('2. The Generative Language API is not enabled for your project');
        console.log('3. There are quota or permission issues');
        console.log('\nPlease visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.log('And ensure the "Generative Language API" is enabled for project: projects/1075130145963');
    }
}

listAvailableModels();
