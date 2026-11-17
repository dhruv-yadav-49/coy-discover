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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/discover"
          className="group flex items-center gap-2.5 transition-transform active:scale-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 shadow-md shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white transition-transform group-hover:rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              coy<span className="text-purple-600">.</span>discover
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:inline-block">
              Privacy First Dating
            </span>
          </div>
        </Link>

        {/* Center / Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-full bg-slate-100/90 p-1 border border-slate-200/50 shadow-inner">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-purple-600" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Quick Match counter badge */}
        <div className="flex items-center gap-2">
          <Link
            href="/discover#matches"
            className="flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50/70 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 active:scale-95 shadow-sm"
            title="View Matches"
          >
            <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
            <span className="hidden sm:inline">Matches</span>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white">
              {matchesCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
