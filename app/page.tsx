import React from "react";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar matchesCount={0} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Simple minimal placeholder as required by assignment specification */}
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto text-purple-600">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Home Placeholder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              As per assignment requirements, the Home tab remains a simple placeholder.
              All active discovery, profile swiping, and mutual matching functionality live in the Discover tab.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-purple-500/25 hover:opacity-95 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Go to Discover</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
