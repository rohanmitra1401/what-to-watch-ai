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
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-3 h-12 px-6 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Sparkles className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Find Vibe <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
            <div className="flex gap-2 justify-center text-sm text-gray-500">
                <span>Try:</span>
                <button onClick={() => setInput("A rainy Sunday in a coffee shop")} className="hover:text-purple-400 transition-colors">"Rainy Sunday"</button>
                <span>•</span>
                <button onClick={() => setInput("Cyberpunk detective noir")} className="hover:text-pink-400 transition-colors">"Cyberpunk Noir"</button>
            </div>
        </div>
    );
}
