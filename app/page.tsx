"use client";

import { useState } from "react";
import { VibeInput } from "@/components/VibeInput";
import { VibeCard } from "@/components/VibeCard";
import { Sparkles, Share2, Check } from "lucide-react";

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
  const [currentVibe, setCurrentVibe] = useState("");
  const [copied, setCopied] = useState(false);

  const handleVibeSearch = async (vibe: string) => {
    setLoading(true);
    setError("");
    setMovies([]);
    setCurrentVibe(vibe);

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

  const handleShare = async () => {
    const movieList = movies
      .map((m) => `🎥 ${m.title} (${m.year})`)
      .join("\n");

    const shareText = `🎬 Vibe Reel found my cinematic match!

My vibe: "${currentVibe}"

${movieList}

Find your vibe → what-to-watch-ai-vert.vercel.app`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Vibe Reel Results",
          text: shareText,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#020205] text-white selection:bg-purple-500/30 selection:text-white overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-pink-600/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-20 flex flex-col items-center min-h-screen relative z-10">

        {/* Header */}
        <div className="text-center mb-20 space-y-6 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-purple-400 mb-4 backdrop-blur-md">
            <Sparkles className="w-3 h-3" />
            Empowered by AI
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-gray-500 text-transparent bg-clip-text drop-shadow-2xl">
            Vibe Reel
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto font-medium leading-relaxed">
            Forget genres. Describe a feeling, a moment, or a dream. <br />
            <span className="text-gray-500">We'll find the cinematic match for your soul.</span>
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
          <div className="w-full max-w-6xl space-y-12 animate-in fade-in duration-700 delay-300">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold tracking-tight">Recommended for your vibe</h2>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    Share Vibe
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {movies.map((movie, index) => (
                <VibeCard key={index} movie={movie} index={index} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

