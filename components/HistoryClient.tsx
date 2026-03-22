"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessions } from "@/hooks/useSessions";
import type { Session } from "@/types";

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " \u20AC";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" }),
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
    <div className="card p-4 flex flex-col gap-3 group animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ink">{date}</span>
            <span className="text-ink-faint">·</span>
            <span className="text-sm text-ink-secondary">{time}</span>
            {relative && (
              <span className="text-2xs font-semibold bg-surface text-ink-secondary px-2 py-0.5 rounded-full border border-ink-faint/30">
                {relative}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-ink-faint
            hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Elimina"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Products */}
      <div className="flex flex-wrap gap-1.5">
        {session.products.map((p) => (
          <span key={p} className="chip-default text-2xs">{p}</span>
        ))}
      </div>

      {/* Best shop */}
      {bestShop ? (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-2xs text-brand-600 font-semibold">Migliore offerta</p>
              <p className="text-sm font-bold text-brand-900 truncate">{bestShop.shop}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="price-tag text-lg text-brand-700">{fmt(bestShop.subtotal)}</p>
            <p className="text-2xs text-brand-600 font-medium">{bestShop.foundCount}/{bestShop.totalProducts} prodotti</p>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-3.5 text-center text-xs text-ink-tertiary border border-ink-faint/30">
          Nessun risultato salvato
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onReload} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Ricarica
        </button>
        <button onClick={onDelete} className="btn-secondary px-3 flex items-center justify-center" aria-label="Elimina">
          <svg className="w-4 h-4 text-ink-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 sm:p-16 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center">
        <svg className="w-7 h-7 text-ink-tertiary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-ink font-semibold">Nessuna ricerca salvata</p>
        <p className="text-ink-tertiary text-sm mt-1.5 leading-relaxed">
          Le ricerche che salvi dalla homepage appariranno qui
        </p>
      </div>
      <Link href="/" className="btn-primary inline-flex items-center gap-2 mt-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        Inizia una ricerca
      </Link>
    </div>
  );
}

export default function HistoryClient() {
  const router = useRouter();
  const { sessions, deleteSession } = useSessions();
  const handleReload = (session: Session) => {
    router.push(`/?p=${session.products.join(",")}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 pt-4 sm:pt-5">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">Storico ricerche</h1>
        {sessions.length > 0 && (
          <p className="text-ink-secondary text-sm mt-1">
            {sessions.length} {sessions.length === 1 ? "ricerca salvata" : "ricerche salvate"}
          </p>
        )}
      </div>

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
    </div>
  );
}
