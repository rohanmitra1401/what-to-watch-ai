import { NextResponse } from "next/server";
import { getMovieRatings } from "@/lib/omdb";

export async function POST(req: Request) {
    try {
        const { title, year } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Missing title" }, { status: 400 });
        }

        const ratings = await getMovieRatings(title, year);
        return NextResponse.json({ ratings });
    } catch (error: any) {
        console.error("Error in /api/ratings:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch ratings" },
            { status: 500 }
        );
    }
}
