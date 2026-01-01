"use client";

import { useEffect, useState } from "react";
import { Film, Star, Award, BarChart3 } from "lucide-react";
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
            className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 border border-gray-700 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            <div className="aspect-[2/3] bg-gray-900 relative group">
                {loadingPoster ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                        {/* Simple Pulse Animation */}
                        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-opacity duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                        <Film className="w-16 h-16 opacity-20 mb-2" />
                        <span className="text-xs opacity-50">No Image Found</span>
                        {/* DEBUG INFO: Only visible if things go wrong */}
                        {!process.env.NEXT_PUBLIC_TMDB_API_KEY && <span className="text-[10px] text-red-500 mt-1">Missing API Key</span>}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white leading-tight">
                        {movie.title}
                    </h3>
                    <p className="text-sm text-gray-400">{movie.year}</p>
                </div>
            </div>
            <div className="p-5">
                <div className="mb-3">
                    <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
                        Vibe Match
                    </span>
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed mb-4">
                    "{movie.vibe_match}"
                </p>

                {/* Ratings Section */}
                {ratings && (ratings.imdb || ratings.rottenTomatoes || ratings.metacritic) && (
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-700/50">
                        {ratings.imdb && (
                            <div className="flex items-center gap-1.5 group/rating relative">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-300">{ratings.imdb}</span>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-md opacity-0 group-hover/rating:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl transform translate-y-1 group-hover/rating:translate-y-0">
                                    IMDb Rating
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                        {ratings.rottenTomatoes && (
                            <div className="flex items-center gap-1.5 group/rating relative">
                                <Award className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-xs font-bold text-gray-300">{ratings.rottenTomatoes}</span>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-md opacity-0 group-hover/rating:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl transform translate-y-1 group-hover/rating:translate-y-0">
                                    Rotten Tomatoes Rating
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                        {ratings.metacritic && (
                            <div className="flex items-center gap-1.5 group/rating relative">
                                <BarChart3 className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs font-bold text-gray-300">{ratings.metacritic}</span>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded-md opacity-0 group-hover/rating:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl transform translate-y-1 group-hover/rating:translate-y-0">
                                    Metacritic
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
