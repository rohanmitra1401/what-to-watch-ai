import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getMoviePoster } from "@/lib/tmdb";

export async function POST(req: Request) {
  try {
    const { userVibe } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("Vibe Request Received:", userVibe); // Debug Log

    if (!apiKey) {
      console.error("Gemini API key missing");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstructions = `
      You are the 'Vibe Reel' engine, a cinematic curator. Your goal is to map abstract human emotions and natural language scenarios to 3 specific films.
      - Identify the Aesthetic, Emotional Frequency, and Pacing of the user's input.
      - Requirement: Return exactly 3 movies in a valid JSON array.
      - Requirement: Each movie object must include: 'title', 'year', 'vibe_match' (a poetic explanation of why it fits), and 'tmdb_search_query' (a clean string for API searching).
      - Diversity: Ensure a mix of classic and modern cinema.
      
      Output strictly valid JSON. No markdown formatting.
    `;

    const prompt = `${systemInstructions}\n\nUser Input: "${userVibe}"`;

    // List of models to try in order of preference
    // The user's key seems to only have access to experimental models (or 1.5 is region locked)
    const models = ["gemini-exp-1206", "gemini-2.0-flash-exp", "gemini-3-flash-preview"];
    let result = null;
    let successfulModel = "";

    // Try models sequentially until one works
    for (const modelName of models) {
      try {
        console.log(`Calling Gemini (${modelName})...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Generate content
        result = await model.generateContent(prompt);
        successfulModel = modelName;
        break; // If successful, exit loop
      } catch (modelError: any) {
        console.warn(`Model ${modelName} failed:`, modelError.message);
        // If it's the last model and it failed, throw the error to be caught by the outer block
        if (modelName === models[models.length - 1]) {
          throw modelError;
        }
        // Otherwise loop to next model
      }
    }

    if (!result) throw new Error("All models failed.");

    const response = await result.response;
    const text = response.text();
    console.log(`Gemini Response (${successfulModel}):`, text.substring(0, 100) + "..."); // Debug Log (truncated)

    // Clean up markdown code blocks if any
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let moviesRaw;
    try {
      moviesRaw = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json({ error: "Failed to parse recommendations" }, { status: 500 });
    }

    // Return Gemini results directly
    // The frontend will lazily load posters via /api/poster
    const movies = moviesRaw;

    return NextResponse.json({ movies });
  } catch (error: any) {
    console.error("Error generating vibes:", error);
    // Return the actual error message for debugging
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
