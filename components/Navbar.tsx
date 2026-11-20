"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Home, Sparkles } from "lucide-react";

interface NavbarProps {
  matchesCount?: number;
}

export default function Navbar({ matchesCount = 0 }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      name: "Discover",
      href: "/discover",
      icon: Compass,
      exact: false,
    },
  ];

  const isActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-3 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/discover"
          className="group flex items-center gap-1.5 sm:gap-2.5 transition-transform active:scale-95 shrink-0"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 shadow-md shadow-purple-500/20 shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-transform group-hover:rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              <span className="inline min-[360px]:hidden">
                coy<span className="text-purple-600">.</span>
              </span>
              <span className="hidden min-[360px]:inline">
                coy<span className="text-purple-600">.</span>discover
              </span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:inline-block mt-0.5">
              Privacy First Dating
            </span>
          </div>
        </Link>

        {/* Center / Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-slate-100/90 p-0.5 sm:p-1 border border-slate-200/50 shadow-inner">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-1 sm:gap-2 rounded-full px-2.5 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${active ? "text-purple-600" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Quick Match counter badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/discover#matches"
            className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-purple-200/80 bg-purple-50/70 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 active:scale-95 shadow-sm"
            title="View Matches"
          >
            <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500 shrink-0" />
            <span className="hidden min-[480px]:inline">Matches</span>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white">
              {matchesCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
