import dns from "node:dns";

// 1. Force Node.js to prefer IPv4.
// This is the cleanest fix for "ECONNRESET" on dual-stack networks in Node 17+.
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "VibeReel/1.0", // Essential for TMDB
                    "Accept": "application/json",
                    "Connection": "keep-alive" // Default to standard behavior
                }
            });

            if (!res.ok) {
                // If it's a 429, we definitely want to wait/retry.
                // If it's 404, retrying won't help.
                if (res.status === 429) throw new Error(`Rate Limit 429`);
                if (res.status >= 500) throw new Error(`Server Error ${res.status}`);
                // For 4xx, just return response to handle gracefully
                return res;
            }
            return res;
        } catch (error: any) {
            const isLastAttempt = i === retries - 1;
            // Only retry network errors or 5xx/429
            console.warn(`Attempt ${i + 1} failed: ${error.message}`);

            if (isLastAttempt) throw error;
            await new Promise(r => setTimeout(r, delay * (i + 1)));
        }
    }
    throw new Error("Max retries reached");
}

export async function getMoviePoster(title: string, year?: string) {
    if (!TMDB_API_KEY) return null;

    try {
        let searchUrl = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1&include_adult=false`;
        if (year) searchUrl += `&year=${year}`;

        console.log(`Searching: ${title} (${year})...`);

        const res = await fetchWithRetry(searchUrl);

        // Check for network success but API failure
        if (!res.ok) {
            console.error(`TMDB API Error: ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const path = data.results[0].poster_path;
            if (path) {
                console.log(`✅ Found poster for: ${title}`);
                return `${IMAGE_BASE_URL}${path}`;
            }
        }

        // Fallback: If searching with Year returned nothing, try without Year
        // (Only if it wasn't a network error)
        if (year) {
            // Strip year from the title if present before retrying
            const titleWithoutYear = title.replace(/\s+\d{4}$/, '').trim();
            console.log(`No results for ${title} (${year}). Retrying as "${titleWithoutYear}" without year filter...`);
            return getMoviePoster(titleWithoutYear);
        }

        console.log(`❌ No poster found for: ${title}`);
        return null;

    } catch (e: any) {
        console.error(`💥 Network/Process Error for ${title}:`, e.message);
        return null;
    }
}
