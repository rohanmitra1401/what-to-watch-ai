const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listAllModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // The SDK doesn't have a direct listModels, but we can use the REST API via fetch
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log("Fetching available models from REST API...");
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\nAvailable Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

listAllModels();
