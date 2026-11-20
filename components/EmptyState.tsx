"use client";

import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Heart, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onReset: () => Promise<void>;
  onViewMatches?: () => void;
  matchesCount?: number;
}

export default function EmptyState({ onReset, onViewMatches, matchesCount = 0 }: EmptyStateProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center py-6 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center animate-fade-in">
      {/* Icon illustration */}
      <div className="relative mb-4 sm:mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-purple-100 via-violet-100 to-pink-100 flex items-center justify-center shadow-inner border border-purple-200/50">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 fill-white" />
        </div>
      </div>

      {/* Primary Message */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
        You&apos;re all caught up!
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 max-w-sm mb-6 sm:mb-8 leading-relaxed">
        You&apos;ve explored all available profiles for now. Check back later for new discoveries, or explore your mutual matches.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full max-w-xs justify-center">
        {matchesCount > 0 && onViewMatches && (
          <button
            onClick={onViewMatches}
            className="flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:bg-purple-700 active:scale-95"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>View Matches ({matchesCount})</span>
          </button>
        )}

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin text-purple-600" : ""}`} />
          <span>{isResetting ? "Resetting Demo..." : "Reset Demo Feed"}</span>
        </button>
      </div>

      <p className="text-[11px] sm:text-xs text-slate-400 mt-4 sm:mt-6">
        *Resetting clears demo swipes and allows you to test the discovery flow again.
      </p>
    </div>
  );
}
