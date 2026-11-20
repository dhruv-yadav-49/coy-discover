"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";
import { DEMO_USER } from "@/lib/constants";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewMatches?: () => void;
  matchedProfile: {
    name: string;
    age: number;
    photo: string;
    city?: string;
  } | null;
}

export default function MatchModal({
  isOpen,
  onClose,
  onViewMatches,
  matchedProfile,
}: MatchModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7C3AED", "#EC4899", "#F43F5E", "#10B981"],
        });
      } catch (e) {
        console.error("Confetti error:", e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !matchedProfile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          data-testid="match-modal"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative z-10 w-full max-w-[340px] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-8 text-center shadow-2xl border border-purple-100"
        >
          {/* Close icon */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading with animated sparkles */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 fill-pink-500 animate-spin" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-purple-600">
              Mutual Connection
            </span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 fill-purple-500 animate-spin" />
          </motion.div>

          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-purple-700 via-pink-600 to-violet-700 bg-clip-text text-transparent mb-2 sm:mb-3"
          >
            IT&apos;S A MATCH!
          </motion.h2>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
            You and <span className="font-semibold text-slate-900">{matchedProfile.name}</span> liked each other!
          </p>

          {/* Dual Profile Photos with Intersecting Heart */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", bounce: 0.4 }}
            className="relative flex items-center justify-center my-4 sm:my-6"
          >
            {/* User Avatar */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden -mr-3 sm:-mr-4 z-10 ring-4 ring-purple-100">
              <Image
                src={DEMO_USER.photo}
                alt="You"
                fill
                sizes="(max-width: 640px) 80px, 112px"
                className="object-cover"
              />
            </div>

            {/* Floating Heart Center Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="absolute z-30 p-2 sm:p-2.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg ring-2 sm:ring-4 ring-white"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </motion.div>

            {/* Matched Avatar */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden -ml-3 sm:-ml-4 z-20 ring-4 ring-pink-100">
              <Image
                src={matchedProfile.photo}
                alt={matchedProfile.name}
                fill
                sizes="(max-width: 640px) 80px, 112px"
                className="object-cover"
              />
            </div>
          </motion.div>

          <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              {matchedProfile.name}, {matchedProfile.age}
            </h4>
            {matchedProfile.city && (
              <p className="text-xs text-slate-500">{matchedProfile.city}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-2.5 pt-1 sm:pt-2">
            {onViewMatches && (
              <button
                type="button"
                data-testid="modal-view-matches-btn"
                onClick={() => {
                  onClose();
                  onViewMatches();
                }}
                className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/25 hover:opacity-95 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>View in Matches</span>
              </button>
            )}

            <button
              type="button"
              data-testid="modal-keep-browsing-btn"
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition active:scale-98"
            >
              Keep Discovering
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
