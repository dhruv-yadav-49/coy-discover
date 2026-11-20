"use client";

import React from "react";
import Image from "next/image";
import { Heart, MapPin, Sparkles, MessageCircleHeart } from "lucide-react";
import { IMatch } from "@/types";

interface MatchesListProps {
  matches: IMatch[];
  loading?: boolean;
  onExploreMore?: () => void;
}

export default function MatchesList({ matches, loading = false, onExploreMore }: MatchesListProps) {
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm animate-pulse space-y-4"
            >
              <div className="aspect-[4/4.5] w-full rounded-2xl bg-slate-200" />
              <div className="h-5 w-2/3 bg-slate-200 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mb-3 sm:mb-4 text-pink-500 shadow-sm">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No matches yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
          Keep discovering and you might find someone special. Likes are mutual, so keep exploring!
        </p>
        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Profiles</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-3 sm:py-6 px-3 sm:px-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 border-b border-slate-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl text-white shadow-sm shrink-0">
            <MessageCircleHeart className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Mutual Matches</h2>
            <p className="text-xs text-slate-500">
              Only people where both of you liked each other appear here.
            </p>
          </div>
        </div>
        <div className="self-start sm:self-auto">
          <span className="rounded-full bg-purple-100 text-purple-700 font-bold px-3 py-1 text-xs">
            {matches.length} {matches.length === 1 ? "Match" : "Matches"}
          </span>
        </div>
      </div>

      {/* Grid of matches */}
      <div data-testid="matches-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {matches.map((match) => {
          const profile = match.profile;
          if (!profile) return null;

          return (
            <div
              key={match.id}
              className="group relative rounded-3xl bg-white border border-slate-200/70 shadow-card hover:shadow-cardHover transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Profile Photo */}
              <div className="relative aspect-[4/4.2] sm:aspect-[4/4.5] w-full overflow-hidden bg-slate-100">
                <Image
                  src={profile.photo}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Match Badge */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-pink-500/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Heart className="w-3 h-3 fill-white" />
                  <span>Mutual Match</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 text-white">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base sm:text-lg font-bold drop-shadow-sm">{profile.name}</h3>
                    <span className="text-sm sm:text-base font-medium opacity-90">{profile.age}</span>
                  </div>
                  {profile.city && (
                    <div className="flex items-center gap-1 text-xs text-slate-200 mt-0.5">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300 shrink-0" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3 bg-white">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  &ldquo;{profile.bio}&rdquo;
                </p>

                {/* Interests chips */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
                    {profile.interests.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-slate-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-600 border border-slate-200/50"
                      >
                        {tag}
                      </span>
                    ))}
                    {profile.interests.length > 3 && (
                      <span className="rounded-full bg-slate-50 px-1.5 sm:px-2 py-0.5 text-[10px] text-slate-400">
                        +{profile.interests.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                  <span>Matched {new Date(match.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-purple-600">Privacy Preserved</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
