"use client";

import React from "react";
import { Heart, X } from "lucide-react";

interface SwipeButtonsProps {
  onSwipe: (action: "like" | "pass") => void;
  disabled?: boolean;
}

export default function SwipeButtons({ onSwipe, disabled = false }: SwipeButtonsProps) {
  const handleAction = (action: "like" | "pass") => {
    if (disabled) return;
    onSwipe(action);
  };

  return (
    <div className="flex items-center justify-center gap-5 sm:gap-6 py-2 sm:py-3 select-none">
      {/* Pass Button */}
      <button
        type="button"
        data-testid="pass-button"
        onClick={() => handleAction("pass")}
        disabled={disabled}
        className="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-card border border-slate-200/80 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none z-20 cursor-pointer touch-manipulation"
        aria-label="Pass profile (swipe left)"
        title="Pass (Swipe Left)"
      >
        <X className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-12 pointer-events-none" />
        <span className="sr-only">Pass</span>
      </button>

      {/* Like Button */}
      <button
        type="button"
        data-testid="like-button"
        onClick={() => handleAction("like")}
        disabled={disabled}
        className="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white text-pink-500 shadow-card border border-pink-100 transition-all duration-200 hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-600 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none z-20 cursor-pointer touch-manipulation"
        aria-label="Like profile (swipe right)"
        title="Like (Swipe Right)"
      >
        <Heart className="h-6 w-6 sm:h-7 sm:w-7 fill-pink-500 text-pink-500 transition-transform duration-200 group-hover:scale-110 pointer-events-none" />
        <span className="sr-only">Like</span>
      </button>
    </div>
  );
}
