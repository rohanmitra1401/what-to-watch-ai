import { NextResponse } from "next/server";
import { generateMoviesWithFallback, Movie } from "@/lib/ai/providers";

export async function POST(req: Request) {
  try {
    const { userVibe, exclude = [] } = await req.json();

    console.log("Vibe Request Received:", userVibe);
    if (exclude.length > 0) {
      console.log("Excluding movies:", exclude);
    }

    if (!userVibe || typeof userVibe !== "string") {
      return NextResponse.json(
        { error: "Please describe your vibe" },
        { status: 400 }
      );
    }

    // Use the multi-provider fallback chain with exclusion list
    const result = await generateMoviesWithFallback(userVibe, exclude);

    // Dedupe: filter out any movies that match exclusion list (case-insensitive)
    const excludeLower = exclude.map((t: string) => t.toLowerCase());
    const uniqueMovies = result.movies.filter(
      (movie: Movie) => !excludeLower.includes(movie.title.toLowerCase())
    );

    // Return top 3 unique movies
    const finalMovies = uniqueMovies.slice(0, 3);

    console.log(`Movies generated via ${result.provider} (${finalMovies.length} unique)`);

    return NextResponse.json({
      movies: finalMovies,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error("Error generating vibes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

