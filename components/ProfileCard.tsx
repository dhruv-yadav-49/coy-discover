"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { MapPin, Heart, X } from "lucide-react";
import { PublicProfile } from "@/types";

interface ProfileCardProps {
  profile: PublicProfile;
  isFront: boolean;
  onSwipe: (action: "like" | "pass") => void;
  isSwiping: boolean;
}

export default function ProfileCard({
  profile,
  isFront,
  onSwipe,
  isSwiping,
}: ProfileCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -20], [1, 0]);

  // Handle drag release
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (isSwiping) return;

    const swipeThreshold = 100;
    const velocityThreshold = 400;

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
        <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-card border border-slate-200/60 scale-[0.96] translate-y-3 opacity-90">
          <div className="relative h-3/5 w-full bg-slate-100">
            <Image
              src={profile.photo}
              alt={profile.name}
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800">{profile.name}</span>
              <span className="text-lg text-slate-500">{profile.age}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{profile.city}</p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Dynamic LIKE Overlay Badge */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="pointer-events-none absolute top-6 left-6 z-30 rounded-2xl border-4 border-emerald-500 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-sm -rotate-12 shadow-lg"
        >
          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-2xl tracking-wider uppercase">
            <Heart className="w-6 h-6 fill-emerald-500 stroke-emerald-600" />
            <span>LIKE</span>
          </div>
        </motion.div>

        {/* Dynamic PASS Overlay Badge */}
        <motion.div
          style={{ opacity: passOpacity }}
          className="pointer-events-none absolute top-6 right-6 z-30 rounded-2xl border-4 border-rose-500 bg-rose-500/10 px-4 py-1.5 backdrop-blur-sm rotate-12 shadow-lg"
        >
          <div className="flex items-center gap-1.5 text-rose-600 font-black text-2xl tracking-wider uppercase">
            <X className="w-6 h-6 stroke-[3]" />
            <span>NOPE</span>
          </div>
        </motion.div>

        {/* Profile Photo Area */}
        <div className="relative w-full h-[58%] overflow-hidden bg-slate-100">
          <Image
            src={profile.photo}
            alt={profile.name}
            fill
            sizes="(max-width: 640px) 100vw, 420px"
            className="object-cover pointer-events-none"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Quick Info overlay at bottom of photo */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
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
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              About
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              &ldquo;{profile.bio}&rdquo;
            </p>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
