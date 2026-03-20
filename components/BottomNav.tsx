"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/",
      label: "Cerca",
      active: pathname === "/",
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      iconFilled: (
        <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      href: "/history",
      label: "Storico",
      active: pathname === "/history",
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconFilled: (
        <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden glass border-t border-ink-faint/30 shadow-bottom-bar pb-safe">
      <div className="flex items-stretch">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
              tab.active
                ? "text-brand-600"
                : "text-ink-tertiary active:text-ink-secondary"
            }`}
          >
            {tab.active ? tab.iconFilled : tab.icon}
            <span className={`text-2xs font-semibold ${tab.active ? "text-brand-600" : ""}`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
