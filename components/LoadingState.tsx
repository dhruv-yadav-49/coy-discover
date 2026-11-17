"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      {/* Skeleton Card */}
      <div className="relative w-full aspect-[3/4.2] max-h-[580px] rounded-3xl bg-white p-3 shadow-card border border-slate-100 flex flex-col justify-end overflow-hidden animate-pulse">
        {/* Placeholder Photo Area */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200" />

        {/* Center Loading Badge */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-auto pt-24 text-slate-400">
          <div className="p-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm mb-3">
            <Sparkles className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-500">
            Finding discoveries nearby...
          </span>
        </div>

        {/* Placeholder Content Area */}
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl p-5 space-y-3 border border-white/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-6 w-32 bg-slate-200 rounded-lg" />
            <div className="h-6 w-10 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-4 w-28 bg-slate-200 rounded-md" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-slate-200 rounded-md" />
            <div className="h-3 w-4/5 bg-slate-200 rounded-md" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-6 w-14 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Placeholder Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
        <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
