import { NextResponse } from "next/server";
import { generateMoviesWithFallback } from "@/lib/ai/providers";

export async function POST(req: Request) {
  try {
    const { userVibe } = await req.json();

    console.log("Vibe Request Received:", userVibe);

    if (!userVibe || typeof userVibe !== "string") {
      return NextResponse.json(
        { error: "Please describe your vibe" },
        { status: 400 }
      );
    }

    // Use the multi-provider fallback chain
    const result = await generateMoviesWithFallback(userVibe);

    console.log(`Movies generated via ${result.provider}`);

    return NextResponse.json({
      movies: result.movies,
      provider: result.provider, // Optional: expose which provider succeeded
    });
  } catch (error: any) {
    console.error("Error generating vibes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

