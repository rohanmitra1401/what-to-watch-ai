"use client";

import { useState } from "react";
import { VibeInput } from "@/components/VibeInput";
import { VibeCard } from "@/components/VibeCard";

interface Movie {
  title: string;
  year: string;
  vibe_match: string;
  tmdb_search_query: string;
  poster_path?: string;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVibeSearch = async (vibe: string) => {
    setLoading(true);
    setError("");
    setMovies([]);

    try {
      const response = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userVibe: vibe }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vibes");
      }

      const data = await response.json();
      if (data.movies) {
        setMovies(data.movies);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. The vibes were too strong (or our server hiccuped).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-screen">

        {/* Header */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            The Vibe Reel
          </h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            Forget genres. Describe a feeling, a moment, or a dream. We'll find the movies that match.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <VibeInput onSubmit={handleVibeSearch} isLoading={loading} />
          {error && (
            <div className="mt-4 text-center text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {movies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl animate-in fade-in duration-500">
            {movies.map((movie, index) => (
              <VibeCard key={index} movie={movie} index={index} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
