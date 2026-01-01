const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Checking available models for API Key...");

    try {
        // There isn't a direct listModels method in the NODE SDK typically exposed this easily 
        // without admin privileges sometimes, but let's try a direct fetch if SDK fails,
        // or assume we just test a few known ones.
        // Actually, the SDK doesn't always expose listModels in the client.
        // Let's brute-force check the ones we care about by trying to generate 1 token.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                console.log("✅ AVAILABLE");
            } catch (error) {
                if (error.message.includes("404")) {
                    console.log("❌ NOT FOUND");
                } else if (error.message.includes("429")) {
                    console.log("⚠️ RATE LIMITED (But Exists)");
                } else {
                    console.log(`❌ ERROR: ${error.message.split('[')[0]}`); // Short error
                }
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
