"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Heart, AlertCircle, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchModal from "@/components/MatchModal";
import MatchesList from "@/components/MatchesList";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { PublicProfile, IMatch, SwipeAction } from "@/types";

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "matches">("discover");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loadingFeed, setLoadingFeed] = useState<boolean>(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [matches, setMatches] = useState<IMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);

  // Swipe in-flight lock to prevent double-swiping
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [swipeExitX, setSwipeExitX] = useState<number>(0);

  // Match Modal state
  const [matchModalOpen, setMatchModalOpen] = useState<boolean>(false);
  const [lastMatchedProfile, setLastMatchedProfile] = useState<{
    name: string;
    age: number;
    photo: string;
    city?: string;
  } | null>(null);

  // Check URL hash for direct tab navigation (e.g. #matches)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#matches") {
        setActiveTab("matches");
      }
    }
  }, []);

  // Fetch Feed profiles
  const fetchFeed = useCallback(async () => {
    setLoadingFeed(true);
    setFeedError(null);
    try {
      const res = await fetch("/api/feed", { cache: "no-store" });
      const data = await res.json();

      if (data.success && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
      } else {
        setFeedError(data.error || "Failed to load profiles. Please verify database connection.");
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
      setFeedError("Unable to reach server. Please check your network and database.");
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  // Fetch Mutual Matches
  const fetchMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed();
    fetchMatches();
  }, [fetchFeed, fetchMatches]);

  // Handle Swipe (drag or button click)
  const handleSwipe = async (action: SwipeAction) => {
    if (isSwiping || profiles.length === 0) return;

    const currentProfile = profiles[0];
    if (!currentProfile) return;

    setIsSwiping(true);
    setSwipeExitX(action === "like" ? 450 : -450);

    // Synchronize animation: briefly wait for exit animation before calling backend
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: currentProfile.id,
          action,
        }),
      });

      const data = await res.json();

      // Remove the swiped profile from the queue
      setProfiles((prev) => prev.slice(1));

      if (data.success && data.isMatch) {
        // Backend confirmed mutual match!
        setLastMatchedProfile({
          name: data.match?.profile?.name || currentProfile.name,
          age: data.match?.profile?.age || currentProfile.age,
          photo: data.match?.profile?.photo || currentProfile.photo,
          city: data.match?.profile?.city || currentProfile.city,
        });
        setMatchModalOpen(true);
        // Refresh matches in background
        fetchMatches();
      }
    } catch (err) {
      console.error("Swipe submission error:", err);
    } finally {
      setIsSwiping(false);
      setSwipeExitX(0);
    }
  };

  // Reset demo feed
  const handleResetDemo = async () => {
    try {
      await fetch("/api/reset", { method: "POST" });
      await Promise.all([fetchFeed(), fetchMatches()]);
    } catch (err) {
      console.error("Failed to reset demo:", err);
    }
  };

  const currentProfile = profiles[0];
  const nextProfile = profiles[1];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar matchesCount={matches.length} />

      {/* Main Discover Layout */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4 sm:py-6">
        {/* Sub-navigation pill toggle: Discover vs Matches */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 border border-slate-300/40 shadow-inner">
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "discover"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
              {profiles.length > 0 && (
                <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-semibold">
                  {profiles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("matches")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "matches"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className={`w-4 h-4 ${matches.length > 0 ? "fill-pink-500 text-pink-500" : ""}`} />
              <span>Matches</span>
              {matches.length > 0 && (
                <span className="rounded-full bg-pink-100 text-pink-700 px-2 py-0.5 text-[10px] font-bold">
                  {matches.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Discovery Screen */}
        {activeTab === "discover" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Error state */}
            {feedError && (
              <div className="w-full max-w-md p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3 shadow-sm mb-6">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="text-base font-bold text-rose-900">Unable to load feed</h3>
                <p className="text-xs text-rose-700 leading-relaxed">{feedError}</p>
                <button
                  onClick={fetchFeed}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading state */}
            {loadingFeed && !feedError && <LoadingState />}

            {/* Empty state: caught up */}
            {!loadingFeed && !feedError && profiles.length === 0 && (
              <EmptyState
                onReset={handleResetDemo}
                onViewMatches={() => setActiveTab("matches")}
                matchesCount={matches.length}
              />
            )}

            {/* Active Card Deck */}
            {!loadingFeed && !feedError && profiles.length > 0 && (
              <div className="w-full flex flex-col items-center">
                {/* 3D Stack Container */}
                <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4.5] max-h-[580px]">
                  {/* Next Profile card (underneath deck visual) */}
                  {nextProfile && (
                    <ProfileCard
                      key={nextProfile.id}
                      profile={nextProfile}
                      isFront={false}
                      onSwipe={handleSwipe}
                      isSwiping={isSwiping}
                    />
                  )}

                  {/* Top Active Card */}
                  <AnimatePresence>
                    {currentProfile && (
                      <motion.div
                        key={currentProfile.id}
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: swipeExitX,
                          transition: { duration: isSwiping ? 0.35 : 0.2 },
                        }}
                        exit={{
                          x: swipeExitX,
                          opacity: 0,
                          rotate: swipeExitX > 0 ? 25 : -25,
                          transition: { duration: 0.3 },
                        }}
                        className="absolute inset-0 z-10"
                      >
                        <ProfileCard
                          profile={currentProfile}
                          isFront={true}
                          onSwipe={handleSwipe}
                          isSwiping={isSwiping}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop & Mobile Action Buttons */}
                <div className="w-full max-w-sm mt-3">
                  <SwipeButtons
                    onSwipe={handleSwipe}
                    disabled={isSwiping || profiles.length === 0}
                  />
                  <p className="text-center text-[11px] text-slate-400">
                    Drag left to Pass • Drag right to Like
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mutual Matches View */}
        {activeTab === "matches" && (
          <MatchesList
            matches={matches}
            loading={loadingMatches}
            onExploreMore={() => setActiveTab("discover")}
          />
        )}
      </div>

      {/* It's a Match celebration modal */}
      <MatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        onViewMatches={() => {
          setActiveTab("matches");
        }}
        matchedProfile={lastMatchedProfile}
      />
    </div>
  );
}
