"use client";

import { useState } from "react";
import type { CartItem } from "@/types";

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

interface CartPanelProps {
  cart: CartItem[];
  onRemove: (product: string) => void;
  onClear: () => void;
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CartItemRow({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          {item.product}
        </p>
        <p className="text-xs text-slate-700 leading-snug line-clamp-2">{item.title}</p>
        <span className="mt-1 inline-flex items-center text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">
          {item.shop}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
        <span className="font-bold text-sm text-slate-800">{fmt(item.price)}</span>
        <div className="flex items-center gap-2">
          {item.affiliateUrl && (
            <a
              href={item.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-green-600 hover:text-green-800 transition-colors"
            >
              Vai →
            </a>
          )}
          <button
            onClick={onRemove}
            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
            aria-label="Rimuovi"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function CartBody({ cart, onRemove, onClear }: CartPanelProps) {
  const total = cart.reduce((s, i) => s + i.price, 0);

  return (
    <>
      <div>
        {cart.map((item) => (
          <CartItemRow
            key={item.product}
            item={item}
            onRemove={() => onRemove(item.product)}
          />
        ))}
      </div>
      <div className="pt-3 mt-1 flex items-center justify-between gap-3">
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
        >
          Svuota carrello
        </button>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Totale stimato</p>
          <p className="text-xl font-extrabold text-green-600 leading-none mt-0.5">{fmt(total)}</p>
        </div>
      </div>
    </>
  );
}

export default function CartPanel({ cart, onRemove, onClear }: CartPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (cart.length === 0) return null;

  const total = cart.reduce((s, i) => s + i.price, 0);

  return (
    <>
      {/* ── Desktop: card inline nella colonna sinistra ── */}
      <div className="hidden lg:block mt-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-5 py-3 bg-green-50/80 border-b border-green-100 flex items-center gap-2">
          <CartIcon className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-green-900 flex-1">Carrello</span>
          <span className="text-xs font-bold bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        </div>
        {/* Content */}
        <div className="px-5 py-2 pb-4">
          <CartBody cart={cart} onRemove={onRemove} onClear={onClear} />
        </div>
      </div>

      {/* ── Mobile: bottom bar + sheet ── */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {sheetOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setSheetOpen(false)}
          />
        )}

        {/* Bottom sheet */}
        {sheetOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <CartIcon className="w-4 h-4 text-green-600" />
              <span className="font-bold text-slate-900 flex-1">Carrello</span>
              <span className="text-xs font-bold bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
              <button
                onClick={() => setSheetOpen(false)}
                className="ml-1 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="px-5 py-2 pb-8 max-h-[60vh] overflow-y-auto pb-safe">
              <CartBody cart={cart} onRemove={onRemove} onClear={onClear} />
            </div>
          </div>
        )}

        {/* Sticky bottom bar */}
        <div className="fixed bottom-4 left-4 right-4 z-40 pb-safe">
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-green-600 text-white rounded-2xl px-5 py-3.5 flex items-center gap-3
              shadow-[0_8px_28px_rgba(22,163,74,0.45)] active:scale-[0.98] transition-transform"
          >
            <CartIcon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left font-semibold text-sm">
              {cart.length} {cart.length === 1 ? "prodotto" : "prodotti"}
            </span>
            <span className="font-extrabold text-base">{fmt(total)}</span>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
