"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VibeInputProps {
    onSubmit: (vibe: string) => void;
    isLoading: boolean;
}

export function VibeInput({ onSubmit, isLoading }: VibeInputProps) {
    const [input, setInput] = useState("");

    const surprises = [
        "A rainy night in Tokyo, 2049",
        "Victorian gothic mystery with a dash of magic",
        "The feeling of being lost in a library that goes on forever",
        "A road trip through the stars with a sentient car",
        "Summer nostalgia but with a hidden secret",
        "Techno-color dream of an underwater city",
        "A quiet cabin in the woods while the world ends",
        "The heat of a desert with a thousand-year-old secret"
    ];

    const handleSurpriseMe = () => {
        const randomVibe = surprises[Math.floor(Math.random() * surprises.length)];
        setInput(randomVibe);
        // We wait a tiny bit to show the user what was typed before submitting
        setTimeout(() => onSubmit(randomVibe), 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input);
        }
    };

    return (
        <div className="max-w-2xl w-full mx-auto space-y-4">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder="I want a movie that feels like..."
                        className={cn(
                            "block w-full p-6 text-lg rounded-lg border-2 border-transparent bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "shadow-[0_0_20px_rgba(168,85,247,0.1)] focus:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                        )}
                    />
                    <div className="absolute right-3 top-3 flex gap-2">
                        <button
                            type="button"
                            onClick={handleSurpriseMe}
                            disabled={isLoading}
                            className="h-12 w-12 flex items-center justify-center bg-gray-800 text-purple-400 rounded-md hover:bg-gray-700 transition-colors border border-purple-500/30"
                            title="Surprise Me"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="h-12 px-6 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent animate-spin rounded-full" />
                            ) : (
                                <>
                                    Find Vibe <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
            <div className="flex flex-wrap gap-2 justify-center items-center text-sm text-gray-500">
                <span className="opacity-60">Try:</span>
                <button
                    type="button"
                    onClick={() => { setInput("Rainy Sunday in Paris"); onSubmit("Rainy Sunday in Paris"); }}
                    className="px-3 py-1 bg-gray-800/50 hover:bg-purple-500/20 hover:text-purple-300 rounded-full border border-gray-700 transition-all"
                >
                    "Rainy Paris"
                </button>
                <button
                    type="button"
                    onClick={() => { setInput("Techno-noir space opera"); onSubmit("Techno-noir space opera"); }}
                    className="px-3 py-1 bg-gray-800/50 hover:bg-pink-500/20 hover:text-pink-300 rounded-full border border-gray-700 transition-all"
                >
                    "Space Noir"
                </button>
                <button
                    type="button"
                    onClick={() => { setInput("Ghibli-esque morning breakfast"); onSubmit("Ghibli-esque morning breakfast"); }}
                    className="px-3 py-1 bg-gray-800/50 hover:bg-blue-500/20 hover:text-blue-300 rounded-full border border-gray-700 transition-all"
                >
                    "Comfort Vibes"
                </button>
            </div>
        </div>
    );
}
