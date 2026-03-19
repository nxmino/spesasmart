"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_16px_rgba(0,0,0,0.05)]">
      {/* Brand accent line */}
      <div className="h-[3px] bg-gradient-to-r from-green-400 via-green-600 to-emerald-500" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-sm shadow-sm group-hover:bg-green-700 group-hover:shadow-md transition-all duration-200">
            🛒
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">
            Spesa<span className="text-green-600">Smart</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          <Link
            href="/"
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/"
                ? "text-green-700 bg-green-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/history"
                ? "text-green-700 bg-green-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Storico</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
