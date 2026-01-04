"use client";

import { useEffect, useState } from "react";
import { Film, Star, Award, BarChart3, ExternalLink, Play, Sparkles } from "lucide-react";
import { getMovieRatings } from "@/lib/omdb";

interface Movie {
    title: string;
    year: string;
    vibe_match: string;
    tmdb_search_query: string;
}

interface VibeCardProps {
    movie: Movie;
    index: number;
}

export function VibeCard({ movie, index }: VibeCardProps) {
    const [posterUrl, setPosterUrl] = useState<string | null>(null);
    const [loadingPoster, setLoadingPoster] = useState(true);
    const [ratings, setRatings] = useState<{ imdb: string | null; rottenTomatoes: string | null; metacritic: string | null } | null>(null);

    const watchUrl = `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title + " " + movie.year)}`;

    useEffect(() => {
        let isMounted = true;

        async function fetchPoster() {
            if (!isMounted) return;

            try {
                const response = await fetch("/api/poster", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: movie.title,
                        year: movie.year,
                        tmdb_search_query: movie.tmdb_search_query
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isMounted) {
                        setPosterUrl(data.posterUrl);
                    }
                }
            } catch (err) {
                console.error("Error fetching poster from API:", err);
            } finally {
                if (isMounted) setLoadingPoster(false);
            }
        }

        async function fetchRatings() {
            if (!isMounted) return;

            try {
                const response = await fetch("/api/ratings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: movie.title,
                        year: movie.year
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (isMounted) {
                        setRatings(data.ratings);
                    }
                }
            } catch (err) {
                console.error("Error fetching ratings from API:", err);
            }
        }

        fetchPoster();
        fetchRatings();

        return () => { isMounted = false; };
    }, [movie]);

    return (
        <div
            className="group relative bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-purple-500/10 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Poster Section */}
            <div className="aspect-[2/3] relative overflow-hidden bg-gray-950">
                {loadingPoster ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin"></div>
                    </div>
                ) : posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 p-4 text-center">
                        <Film className="w-16 h-16 opacity-10 mb-2" />
                        <span className="text-xs opacity-40">Visual missing from archive</span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-75"></div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex justify-between items-end gap-2">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-1 drop-shadow-lg">
                                {movie.title}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 backdrop-blur-md text-gray-300 border border-white/10">
                                {movie.year}
                            </span>
                        </div>

                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-lg shadow-purple-600/20"
                        >
                            <Play className="w-3 h-3 fill-current" />
                            Watch Now
                        </a>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-purple-400 uppercase">
                            The Vibe
                        </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium italic">
                        "{movie.vibe_match}"
                    </p>
                </div>

                {/* Ratings Section */}
                {ratings && (ratings.imdb || ratings.rottenTomatoes || ratings.metacritic) && (
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        {ratings.imdb && (
                            <div className="flex items-center gap-2 group/rating cursor-help">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-400 group-hover/rating:text-white transition-colors">{ratings.imdb}</span>
                            </div>
                        )}
                        {ratings.rottenTomatoes && (
                            <div className="flex items-center gap-2 group/rating cursor-help">
                                <Award className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-gray-400 group-hover/rating:text-white transition-colors">{ratings.rottenTomatoes}</span>
                            </div>
                        )}
                        {ratings.metacritic && (
                            <div className="flex items-center gap-2 group/rating cursor-help">
                                <BarChart3 className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-gray-400 group-hover/rating:text-white transition-colors">{ratings.metacritic}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Subtle light leak effect on top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
    );
}
