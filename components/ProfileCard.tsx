"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { MapPin, Heart, X, User } from "lucide-react";
import { PublicProfile } from "@/types";

interface ProfileCardProps {
  profile: PublicProfile;
  isFront: boolean;
  onSwipe: (action: "like" | "pass") => void;
  isSwiping: boolean;
  activeStamp?: "like" | "pass" | null;
}

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";

export default function ProfileCard({
  profile,
  isFront,
  onSwipe,
  isSwiping,
  activeStamp = null,
}: ProfileCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(profile.photo || FALLBACK_PHOTO);
  const [imgError, setImgError] = useState<boolean>(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const dragLikeOpacity = useTransform(x, [20, 120], [0, 1]);
  const dragPassOpacity = useTransform(x, [-120, -20], [1, 0]);

  // Handle drag release on touch/mouse
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (isSwiping) return;

    const swipeThreshold = 90;
    const velocityThreshold = 350;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onSwipe("like");
    } else if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      onSwipe("pass");
    }
  };

  if (!isFront) {
    // Underneath card in the stack (non-interactive, provides deck depth)
    return (
      <div className="absolute inset-0 z-0 origin-bottom transform transition-all duration-300">
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-card border border-slate-200/60 scale-[0.96] translate-y-3 opacity-90 flex flex-col justify-between">
          <div className="relative h-[58%] w-full bg-slate-100">
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
          <div className="p-5 flex-1 flex flex-col justify-between bg-white">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800">{profile.name}</span>
              <span className="text-lg text-slate-500">{profile.age}</span>
            </div>
            {profile.city && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
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
    <motion.div
      style={{
        x,
        rotate,
      }}
      drag={!isSwiping ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing select-none touch-none"
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-card border border-slate-200/80 flex flex-col justify-between">
        {/* Dynamic LIKE Overlay Badge (shows while dragging right or on like button click) */}
        <motion.div
          style={{ opacity: showLikeStamp ? 1 : dragLikeOpacity }}
          className={`pointer-events-none absolute top-6 left-6 z-30 rounded-2xl border-4 border-emerald-500 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm -rotate-12 shadow-lg transition-opacity ${
            showLikeStamp ? "opacity-100" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-2xl tracking-wider uppercase">
            <Heart className="w-6 h-6 fill-emerald-500 stroke-emerald-600" />
            <span>LIKE</span>
          </div>
        </motion.div>

        {/* Dynamic PASS Overlay Badge (shows while dragging left or on pass button click) */}
        <motion.div
          style={{ opacity: showPassStamp ? 1 : dragPassOpacity }}
          className={`pointer-events-none absolute top-6 right-6 z-30 rounded-2xl border-4 border-rose-500 bg-rose-500/10 px-4 py-1.5 backdrop-blur-sm rotate-12 shadow-lg transition-opacity ${
            showPassStamp ? "opacity-100" : ""
          }`}
        >
          <div className="flex items-center gap-1.5 text-rose-600 font-black text-2xl tracking-wider uppercase">
            <X className="w-6 h-6 stroke-[3]" />
            <span>NOPE</span>
          </div>
        </motion.div>

        {/* Profile Photo Area */}
        <div className="relative w-full h-[58%] overflow-hidden bg-slate-100">
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
              <User className="h-20 w-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* Quick Info overlay at bottom of photo */}
          <div className="absolute bottom-3 left-4 right-4 text-white pointer-events-none">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {profile.name}
              </h2>
              <span className="text-xl sm:text-2xl font-light opacity-95">
                {profile.age}
              </span>
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-200 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <span>{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Bio & Interests Details Area */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-white overflow-y-auto">
          {/* Bio text */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              About
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              &ldquo;{profile.bio}&rdquo;
            </p>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Interests
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 border border-purple-200/60"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
