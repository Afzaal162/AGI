require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_CLOUD_API_KEY });

async function run() {
    const models = await genai.models.list();
    console.log('\n--- YOUR AVAILABLE MODELS ---\n');
    for await (const m of models) {
        console.log(m.name, '|', m.supportedActions?.join(', '));
    }
}

run().catch(console.error);