import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Unified movie response interface
export interface Movie {
    title: string;
    year: string;
    vibe_match: string;
    tmdb_search_query: string;
}

export interface ProviderResult {
    movies: Movie[];
    provider: string;
}

// System instructions for all providers
const SYSTEM_PROMPT = `You are the 'Vibe Reel' engine, a cinematic curator. Your goal is to map abstract human emotions, sensory descriptions, and natural language scenarios to cinematic masterpieces.
- Analyze the Aesthetic, Emotional Frequency, and Narrative Tension of the user's input.
- Requirement: Return exactly 4 movies in a valid JSON array.
- Requirement: Each movie object must include: 'title', 'year', 'vibe_match' (a poetic, evocative explanation of why it fits the vibe), and 'tmdb_search_query' (the movie title ONLY, without year or extra text).
- Diversity: Provide a mix of world cinema, classics, and modern hits. Avoid the most obvious choices unless they are a perfect fit.

Output strictly valid JSON. No markdown formatting.`;

// Build prompt with optional exclusion list
function buildPrompt(userVibe: string, exclude: string[]): string {
    let prompt = SYSTEM_PROMPT;
    if (exclude.length > 0) {
        prompt += `\n\nIMPORTANT: Do NOT recommend any of these movies (the user has already seen them): ${exclude.join(", ")}.`;
    }
    prompt += `\n\nUser Input: "${userVibe}"`;
    return prompt;
}

// ============================================
// GEMINI PROVIDER
// ============================================
async function tryGemini(userVibe: string, exclude: string[] = []): Promise<ProviderResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("[Gemini] Skipping - GEMINI_API_KEY not configured");
        throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = buildPrompt(userVibe, exclude);

    // Models to try in order of preference
    const models = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ];

    let lastError: Error | null = null;

    for (const modelName of models) {
        try {
            console.log(`[Gemini] Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if any
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const movies = JSON.parse(cleanText);

            console.log(`[Gemini] Success with ${modelName}`);
            return { movies, provider: `gemini:${modelName}` };
        } catch (error: any) {
            console.warn(`[Gemini] ${modelName} failed:`, error.message);
            lastError = error;

            // If rate limited, wait briefly before trying next model
            if (error.status === 429 || error.message?.includes("429")) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    }

    throw lastError || new Error("All Gemini models failed");
}

// ============================================
// GROQ PROVIDER (Llama 3)
// ============================================
async function tryGroq(userVibe: string, exclude: string[] = []): Promise<ProviderResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.log("[Groq] Skipping - GROQ_API_KEY not configured");
        throw new Error("GROQ_API_KEY not configured");
    }

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });

    console.log("[Groq] Trying llama-3.3-70b-versatile...");

    const systemPrompt = exclude.length > 0
        ? `${SYSTEM_PROMPT}\n\nIMPORTANT: Do NOT recommend any of these movies (the user has already seen them): ${exclude.join(", ")}.`
        : SYSTEM_PROMPT;

    const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userVibe },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");

    const parsed = JSON.parse(text);
    // Handle both array and object with "movies" key
    const movies = Array.isArray(parsed) ? parsed : parsed.movies || parsed;

    console.log("[Groq] Success");
    return { movies, provider: "groq:llama-3.3-70b" };
}

// ============================================
// DEEPSEEK PROVIDER
// ============================================
async function tryDeepSeek(userVibe: string, exclude: string[] = []): Promise<ProviderResult> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        console.log("[DeepSeek] Skipping - DEEPSEEK_API_KEY not configured");
        throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.deepseek.com",
    });

    console.log("[DeepSeek] Trying deepseek-chat...");

    const systemPrompt = exclude.length > 0
        ? `${SYSTEM_PROMPT}\n\nIMPORTANT: Do NOT recommend any of these movies (the user has already seen them): ${exclude.join(", ")}.`
        : SYSTEM_PROMPT;

    const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userVibe },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from DeepSeek");

    const parsed = JSON.parse(text);
    const movies = Array.isArray(parsed) ? parsed : parsed.movies || parsed;

    console.log("[DeepSeek] Success");
    return { movies, provider: "deepseek:v3" };
}

// ============================================
// MAIN FALLBACK CHAIN
// ============================================
export async function generateMoviesWithFallback(
    userVibe: string,
    exclude: string[] = []
): Promise<ProviderResult> {
    const providers = [
        { name: "Gemini", fn: (vibe: string) => tryGemini(vibe, exclude) },
        { name: "Groq", fn: (vibe: string) => tryGroq(vibe, exclude) },
        { name: "DeepSeek", fn: (vibe: string) => tryDeepSeek(vibe, exclude) },
    ];

    let lastError: Error | null = null;

    for (const provider of providers) {
        try {
            return await provider.fn(userVibe);
        } catch (error: any) {
            console.warn(`[Fallback] ${provider.name} failed:`, error.message);
            lastError = error;
            // Continue to next provider
        }
    }

    // All providers failed
    const isAllMissingKeys =
        !process.env.GEMINI_API_KEY &&
        !process.env.GROQ_API_KEY &&
        !process.env.DEEPSEEK_API_KEY;

    if (isAllMissingKeys) {
        throw new Error(
            "No AI providers configured. Please set GEMINI_API_KEY, GROQ_API_KEY, or DEEPSEEK_API_KEY."
        );
    }

    throw new Error(
        "The cinematic oracle is overwhelmed. Please try again in a moment."
    );
}
