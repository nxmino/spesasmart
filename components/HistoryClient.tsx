"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessions } from "@/hooks/useSessions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Session } from "@/types";

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
    relative: getRelative(d),
  };
}

function getRelative(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Adesso";
  if (diffMins < 60) return `${diffMins} min fa`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h fa`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}g fa`;
  return null;
}

function SessionCard({
  session,
  onDelete,
  onReload,
}: {
  session: Session;
  onDelete: () => void;
  onReload: () => void;
}) {
  const bestShop = session.results?.[0] ?? null;
  const { date, time, relative } = formatDate(session.createdAt);

  return (
    <div className="card p-5 flex flex-col gap-4 group animate-fade-in">
      {/* Header card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{date}</span>
            <span className="text-slate-400 text-sm">•</span>
            <span className="text-sm text-slate-500">{time}</span>
            {relative && (
              <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {relative}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{session.label}</p>
        </div>

        {/* Elimina */}
        <button
          onClick={onDelete}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
            hover:text-red-500 hover:bg-red-50 transition-all duration-150 opacity-0 group-hover:opacity-100
            focus:opacity-100"
          aria-label="Elimina sessione"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Prodotti cercati */}
      <div className="flex flex-wrap gap-1.5">
        {session.products.map((p) => (
          <span
            key={p}
            className="inline-flex items-center text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Best shop highlight */}
      {bestShop ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-green-700 font-medium">Migliore offerta</p>
              <p className="text-sm font-semibold text-green-900 truncate">{bestShop.shop}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-green-700">{fmt(bestShop.subtotal)}</p>
            <p className="text-xs text-green-600">
              {bestShop.foundCount}/{bestShop.totalProducts} prodotti
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-3.5 text-center text-xs text-slate-400">
          Nessun risultato salvato
        </div>
      )}

      {/* Azioni */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={onReload}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Ricarica ricerca
        </button>
        <button
          onClick={onDelete}
          className="btn-secondary flex items-center justify-center px-3"
          aria-label="Elimina"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 sm:p-16 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
        📋
      </div>
      <div>
        <p className="text-slate-700 font-semibold text-base">Nessuna ricerca salvata</p>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">
          Le ricerche che salvi dalla homepage appariranno qui
        </p>
      </div>
      <Link
        href="/"
        className="btn-primary inline-flex items-center gap-2 mt-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Inizia una ricerca
      </Link>
    </div>
  );
}

export default function HistoryClient() {
  const router = useRouter();
  const { sessions, deleteSession } = useSessions();
  const [, setReload] = useLocalStorage<{ products: string[] } | null>(
    "spesasmart_reload",
    null
  );

  const handleReload = (session: Session) => {
    setReload({ products: session.products });
    router.push("/");
  };

  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Le tue ricerche salvate
          </h1>
          {sessions.length > 0 && (
            <p className="text-slate-500 text-sm mt-1">
              {sessions.length} {sessions.length === 1 ? "ricerca salvata" : "ricerche salvate"}
            </p>
          )}
        </div>

        {/* Contenuto */}
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={() => deleteSession(session.id)}
                onReload={() => handleReload(session)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
