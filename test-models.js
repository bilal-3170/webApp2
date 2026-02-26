// Test script to list available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('Fetching available models...\n');
        
        // Try different model names
        const modelsToTry = [
            'gemini-pro',
            'gemini-pro-vision',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest',
            'models/gemini-pro',
            'models/gemini-pro-vision',
            'models/gemini-1.5-pro',
            'models/gemini-1.5-flash'
        ];
        
        console.log('Testing model availability...\n');
        
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                console.log(`✓ ${modelName} - Available`);
            } catch (error) {
                console.log(`✗ ${modelName} - Not available`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
