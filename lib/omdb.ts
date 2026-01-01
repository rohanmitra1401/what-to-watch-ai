interface Rating {
    Source: string;
    Value: string;
}

interface OmdbData {
    Ratings?: Rating[];
    imdbRating?: string;
    Metascore?: string;
    Response: string;
    Error?: string;
}

export async function getMovieRatings(title: string, year?: string) {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
        console.warn("OMDb API key is missing");
        return null;
    }

    try {
        const query = encodeURIComponent(title);
        let url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${query}`;
        if (year) {
            url += `&y=${year}`;
        }

        const res = await fetch(url);
        const data: OmdbData = await res.json();

        if (data.Response === "True") {
            const rtRating = data.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value;
            return {
                imdb: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null,
                rottenTomatoes: rtRating || null,
                metacritic: data.Metascore && data.Metascore !== "N/A" ? data.Metascore : null,
            };
        }

        // If title+year failed, try title only
        if (year) {
            return getMovieRatings(title);
        }

        return null;
    } catch (error) {
        console.error("OMDb fetch error:", error);
        return null;
    }
}
