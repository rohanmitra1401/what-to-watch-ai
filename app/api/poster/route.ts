import { NextResponse } from "next/server";
import { getMoviePoster } from "@/lib/tmdb";

async function fetchWikiPoster(title: string) {
    try {
        console.log("Fallback to Wiki for", title);
        const wikiSearchQuery = encodeURIComponent(`${title} film`);
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${wikiSearchQuery}&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json&origin=*`;

        const wikiRes = await fetch(wikiUrl);
        const wikiData = await wikiRes.json();
        const pages = wikiData.query?.pages;

        if (pages) {
            const pageIds = Object.keys(pages);
            if (pageIds.length > 0) {
                const bestPage = pages[pageIds[0]];
                if (bestPage.thumbnail?.source) {
                    return bestPage.thumbnail.source;
                }
            }
        }
        return null;
    } catch (wikiError) {
        console.error("Wiki fetch error", wikiError);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const { title, year, tmdb_search_query } = await req.json();

        if (!title && !tmdb_search_query) {
            return NextResponse.json({ error: "Missing title or search query" }, { status: 400 });
        }

        // Try TMDB first
        let posterUrl = await getMoviePoster(tmdb_search_query || title, year);

        // Fallback to Wikipedia if TMDB fails or returns no poster
        if (!posterUrl) {
            posterUrl = await fetchWikiPoster(title);
        }

        return NextResponse.json({ posterUrl });
    } catch (error: any) {
        console.error("Error in /api/poster:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch poster" },
            { status: 500 }
        );
    }
}
