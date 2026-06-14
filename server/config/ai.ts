import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";

// Ensure environment variables are loaded before initializing the client
config();

if (!process.env.GOOGLE_CLOUD_API_KEY) {
    console.warn("⚠️ WARNING: GOOGLE_CLOUD_API_KEY is undefined. Check your .env file alignment.");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

export default ai;