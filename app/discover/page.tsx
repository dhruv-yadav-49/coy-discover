"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

  // Swipe in-flight lock and visual animation state
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const isSwipingRef = useRef<boolean>(false);
  const profilesRef = useRef<PublicProfile[]>([]);
  profilesRef.current = profiles;

  const [swipeExitX, setSwipeExitX] = useState<number>(0);
  const [activeStamp, setActiveStamp] = useState<"like" | "pass" | null>(null);

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
    const handleHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#matches") {
          setActiveTab("matches");
        } else if (window.location.hash === "#discover" || !window.location.hash) {
          setActiveTab("discover");
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleTabChange = (tab: "discover" | "matches") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "matches" ? "#matches" : "#discover";
    }
  };

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

  // Handle Swipe (drag or button click) with robust synchronous lock and full lifecycle tracing
  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      // 1. Immediate synchronous lock: blocks rapid taps, double keydown, or concurrent gestures
      if (isSwipingRef.current || profilesRef.current.length === 0) {
        console.warn("[SWIPE_BLOCKED] In-flight swipe already active or deck empty.");
        return;
      }
      isSwipingRef.current = true;
      setIsSwiping(true);

      const currentProfile = profilesRef.current[0];
      if (!currentProfile) {
        isSwipingRef.current = false;
        setIsSwiping(false);
        return;
      }

      const profileId = currentProfile.id;
      const profileName = currentProfile.name;
      const requestId = `swipe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const startTime = Date.now();

      console.log(
        `[SWIPE_FRONTEND_START] [${requestId}] Profile ID: "${profileId}", Name: "${profileName}", Action: "${action.toUpperCase()}", Time: ${new Date(startTime).toISOString()}`
      );

      // Trigger visual stamp and exit trajectory
      setActiveStamp(action);
      setSwipeExitX(action === "like" ? 500 : -500);

      try {
        // Parallel execution of backend API call and exit transition duration
        const [res] = await Promise.all([
          fetch("/api/swipe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-request-id": requestId,
            },
            body: JSON.stringify({
              profileId,
              action,
              requestId,
            }),
          }),
          new Promise((resolve) => setTimeout(resolve, 320)),
        ]);

        const data = await res.json();
        const apiDuration = Date.now() - startTime;

        console.log(
          `[SWIPE_FRONTEND_RESPONSE] [${requestId}] Status: ${res.status}, isMatch: ${data.isMatch}, API Duration: ${apiDuration}ms`
        );

        if (res.ok && data.success) {
          // Strictly remove ONLY the exact profile that was swiped
          setProfiles((prev) => prev.filter((p) => p.id !== profileId));

          if (data.isMatch) {
            console.log(
              `[SWIPE_FRONTEND_MATCH] [${requestId}] Mutual Match confirmed for "${profileName}"! Triggering Match Modal.`
            );
            setLastMatchedProfile({
              name: data.match?.profile?.name || currentProfile.name,
              age: data.match?.profile?.age || currentProfile.age,
              photo: data.match?.profile?.photo || currentProfile.photo,
              city: data.match?.profile?.city || currentProfile.city,
            });
            setMatchModalOpen(true);

            console.log(`[SWIPE_FRONTEND_MATCHES] [${requestId}] Refreshing mutual matches list...`);
            await fetchMatches();
            console.log(`[SWIPE_FRONTEND_MATCHES] [${requestId}] Mutual matches list updated.`);
          } else {
            console.log(
              `[SWIPE_FRONTEND_NO_MATCH] [${requestId}] "${profileName}" processed (no mutual match).`
            );
          }
        } else {
          // API error occurred (e.g. 409 or 500)
          console.error(
            `[SWIPE_FRONTEND_ERROR] [${requestId}] Failed to record swipe on "${profileName}": ${data.error || "Unknown error"}`
          );
          // DO NOT advance the card on error so the user doesn't lose profiles!
        }
      } catch (err) {
        console.error(`[SWIPE_FRONTEND_NETWORK_ERROR] [${requestId}] Network error:`, err);
      } finally {
        const totalDuration = Date.now() - startTime;
        console.log(
          `[SWIPE_FRONTEND_COMPLETE] [${requestId}] Swipe cycle finished in ${totalDuration}ms. Releasing lock.`
        );
        setActiveStamp(null);
        setSwipeExitX(0);
        isSwipingRef.current = false;
        setIsSwiping(false);
      }
    },
    [fetchMatches]
  );

  // Keyboard navigation: Left Arrow -> Pass, Right Arrow -> Like
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "discover" || matchModalOpen) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("pass");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("like");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, matchModalOpen, handleSwipe]);

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

      {/* Sticky Secondary Tab Bar: Always accessible on scroll */}
      <div className="sticky top-14 sm:top-16 z-30 w-full bg-slate-50/95 backdrop-blur-md border-b border-slate-200/60 shadow-xs transition-all">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-center">
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 border border-slate-300/40 shadow-inner">
            <button
              onClick={() => handleTabChange("discover")}
              data-testid="discover-tab-btn"
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "discover"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
              {profiles.length > 0 && (
                <span className="rounded-full bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 text-[10px] font-semibold">
                  {profiles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange("matches")}
              data-testid="matches-tab-btn"
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "matches"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className={`w-4 h-4 ${matches.length > 0 ? "fill-pink-500 text-pink-500" : ""}`} />
              <span>Matches</span>
              {matches.length > 0 && (
                <span className="rounded-full bg-pink-100 text-pink-700 px-1.5 sm:px-2 py-0.5 text-[10px] font-bold">
                  {matches.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-3 sm:px-6 py-2 sm:py-6">
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
                onViewMatches={() => handleTabChange("matches")}
                matchesCount={matches.length}
              />
            )}

            {/* Active Card Deck */}
            {!loadingFeed && !feedError && profiles.length > 0 && (
              <div className="w-full flex flex-col items-center">
                {/* 3D Stack Container */}
                <div className="relative w-full max-w-[340px] sm:max-w-sm aspect-[3/4.4] sm:aspect-[3/4.5] max-h-[min(560px,calc(100svh-220px))] min-h-[380px]">
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
                  <AnimatePresence onExitComplete={() => console.log("[PRESENCE_EXIT_COMPLETE] Top card exit completed")}>
                    {currentProfile && (
                      <motion.div
                        key={currentProfile.id}
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{
                          x: swipeExitX !== 0 ? swipeExitX : 500,
                          opacity: 0,
                          scale: 0.9,
                          transition: { duration: 0.2 },
                        }}
                        drag={!isSwiping ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragEnd={(_e, info) => {
                          if (isSwipingRef.current) return;
                          if (info.offset.x > 80 || info.velocity.x > 350) {
                            handleSwipe("like");
                          } else if (info.offset.x < -80 || info.velocity.x < -350) {
                            handleSwipe("pass");
                          }
                        }}
                        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing select-none touch-pan-y"
                      >
                        <ProfileCard
                          profile={currentProfile}
                          isFront={true}
                          onSwipe={handleSwipe}
                          isSwiping={isSwiping}
                          activeStamp={activeStamp}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop & Mobile Action Buttons */}
                <div className="w-full max-w-sm mt-1 sm:mt-3">
                  <SwipeButtons
                    onSwipe={handleSwipe}
                    disabled={isSwiping || profiles.length === 0}
                  />
                  <p className="text-center text-[10px] sm:text-[11px] text-slate-400">
                    Drag left to Pass • Drag right to Like • Keyboard: ← / →
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
            onExploreMore={() => handleTabChange("discover")}
          />
        )}
      </div>

      {/* It's a Match celebration modal */}
      <MatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        onViewMatches={() => {
          handleTabChange("matches");
        }}
        matchedProfile={lastMatchedProfile}
      />
    </div>
  );
}
