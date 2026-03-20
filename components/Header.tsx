"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 glass border-b border-ink-faint/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-brand-900 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            <svg className="w-4 h-4 text-brand-300" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <span className="font-extrabold text-ink text-lg tracking-tight">
            Spesa<span className="text-brand-600">Smart</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
              pathname === "/"
                ? "text-brand-700 bg-brand-50"
                : "text-ink-secondary hover:text-ink hover:bg-surface"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Cerca
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
              pathname === "/history"
                ? "text-brand-700 bg-brand-50"
                : "text-ink-secondary hover:text-ink hover:bg-surface"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Storico
          </Link>
        </nav>
      </div>
    </header>
  );
}
