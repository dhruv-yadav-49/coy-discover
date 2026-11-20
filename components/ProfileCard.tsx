"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Heart, X, User } from "lucide-react";
import { PublicProfile } from "@/types";

interface ProfileCardProps {
  profile: PublicProfile;
  isFront: boolean;
  onSwipe: (action: "like" | "pass") => void;
  isSwiping: boolean;
  activeStamp?: "like" | "pass" | null;
  exitX?: number;
}

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";

export default function ProfileCard({
  profile,
  isFront,
  isSwiping,
  activeStamp = null,
}: ProfileCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(profile.photo || FALLBACK_PHOTO);
  const [imgError, setImgError] = useState<boolean>(false);

  if (!isFront) {
    // Underneath card in the stack (non-interactive, provides deck depth)
    return (
      <div className="absolute inset-0 z-0 origin-bottom transform transition-all duration-300">
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-card border border-slate-200/60 scale-[0.96] translate-y-2 sm:translate-y-3 opacity-90 flex flex-col justify-between">
          <div className="relative h-[56%] sm:h-[58%] w-full bg-slate-100">
            {!imgError ? (
              <Image
                src={photoUrl}
                alt={profile.name}
                fill
                sizes="(max-width: 640px) 100vw, 420px"
                className="object-cover"
                priority={false}
                onError={() => {
                  setImgError(true);
                  setPhotoUrl(FALLBACK_PHOTO);
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                <User className="h-16 w-16" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between bg-white">
            <div className="flex items-baseline gap-2">
              <span data-testid="underneath-profile-name" className="text-lg sm:text-xl font-bold text-slate-800">{profile.name}</span>
              <span className="text-base sm:text-lg text-slate-500">{profile.age}</span>
            </div>
            {profile.city && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>{profile.city}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine active stamps whether from dragging or button click
  const showLikeStamp = activeStamp === "like";
  const showPassStamp = activeStamp === "pass";

  return (
    <div
      className={`h-full w-full select-none touch-pan-y ${
        !isFront || isSwiping ? "pointer-events-none" : ""
      }`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-card border border-slate-200/80 flex flex-col justify-between">
        {/* Dynamic LIKE Overlay Badge (shows while dragging right or on like button click) */}
        <div
          className={`pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6 z-30 rounded-2xl border-2 sm:border-4 border-emerald-500 bg-emerald-500/10 px-3 py-1 sm:px-4 sm:py-1.5 backdrop-blur-sm -rotate-12 shadow-lg transition-opacity duration-150 ${
            showLikeStamp ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-600 font-black text-xl sm:text-2xl tracking-wider uppercase">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-emerald-500 stroke-emerald-600" />
            <span>LIKE</span>
          </div>
        </div>

        {/* Dynamic PASS Overlay Badge (shows while dragging left or on pass button click) */}
        <div
          className={`pointer-events-none absolute top-4 right-4 sm:top-6 sm:right-6 z-30 rounded-2xl border-2 sm:border-4 border-rose-500 bg-rose-500/10 px-3 py-1 sm:px-4 sm:py-1.5 backdrop-blur-sm rotate-12 shadow-lg transition-opacity duration-150 ${
            showPassStamp ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 text-rose-600 font-black text-xl sm:text-2xl tracking-wider uppercase">
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span>NOPE</span>
          </div>
        </div>

        {/* Profile Photo Area */}
        <div className="relative w-full h-[56%] sm:h-[58%] overflow-hidden bg-slate-100">
          {!imgError ? (
            <Image
              src={photoUrl}
              alt={profile.name}
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-cover pointer-events-none"
              priority={true}
              onError={() => {
                setImgError(true);
                setPhotoUrl(FALLBACK_PHOTO);
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
              <User className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* Quick Info overlay at bottom of photo */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-3.5 right-3.5 sm:left-4 sm:right-4 text-white pointer-events-none">
            <div className="flex items-baseline gap-2">
              <h2 data-testid="active-profile-name" className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md truncate">
                {profile.name}
              </h2>
              <span className="text-lg sm:text-2xl font-light opacity-95 shrink-0">
                {profile.age}
              </span>
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-200 mt-0.5">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300 shrink-0" />
                <span>{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Bio & Interests Details Area */}
        <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between bg-white overflow-y-auto">
          {/* Bio text */}
          <div className="space-y-1">
            <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-700">
              About
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal line-clamp-3 sm:line-clamp-4">
              &ldquo;{profile.bio}&rdquo;
            </p>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100">
              <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Interests
              </h4>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-purple-50 px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium text-purple-700 border border-purple-200/60"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
