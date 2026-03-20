"use client";

import { useState } from "react";
import type { CartItem } from "@/types";

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " \u20AC";
}

interface CartPanelProps {
  cart: CartItem[];
  onRemove: (product: string) => void;
  onClear: () => void;
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function groupByShop(cart: CartItem[]) {
  const map = new Map<string, { shop: string; items: CartItem[]; shippingCost: number | null }>();
  for (const item of cart) {
    if (!map.has(item.shopKey)) {
      map.set(item.shopKey, { shop: item.shop, items: [], shippingCost: null });
    }
    const entry = map.get(item.shopKey)!;
    entry.items.push(item);
    if (entry.shippingCost === null && item.shippingCost !== undefined) {
      entry.shippingCost = item.shippingCost;
    }
  }
  return Array.from(map.values());
}

function CartBody({ cart, onRemove, onClear }: CartPanelProps) {
  const groups = groupByShop(cart);
  const itemsTotal = cart.reduce((s, i) => s + i.price, 0);
  const shippingTotal = groups.reduce((s, g) => s + (g.shippingCost ?? 0), 0);
  const grandTotal = itemsTotal + shippingTotal;
  const hasKnownShipping = groups.some((g) => g.shippingCost !== null);

  return (
    <>
      {groups.map((group) => (
        <div key={group.shop} className="mb-2">
          <p className="text-2xs font-bold text-ink-tertiary uppercase tracking-wider mt-3 mb-1.5 first:mt-1">
            {group.shop}
          </p>
          {group.items.map((item) => (
            <div key={item.product} className="flex items-start gap-3 py-2.5 border-b border-ink-faint/20 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-2xs font-bold text-ink-tertiary uppercase tracking-wider mb-0.5">{item.product}</p>
                <p className="text-xs text-ink leading-snug line-clamp-2">{item.title}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                <span className="price-tag text-sm text-ink">{fmt(item.price)}</span>
                <div className="flex items-center gap-2">
                  {item.affiliateUrl && (
                    <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-2xs font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                      Vai
                    </a>
                  )}
                  <button onClick={() => onRemove(item.product)} className="w-5 h-5 flex items-center justify-center rounded-full text-ink-faint hover:bg-red-50 hover:text-red-500 transition-all" aria-label="Rimuovi">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Shipping per shop */}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-2xs text-ink-tertiary">Spedizione</span>
            {group.shippingCost === null ? (
              <span className="text-2xs text-ink-tertiary italic">N/D</span>
            ) : group.shippingCost === 0 ? (
              <span className="text-2xs font-semibold text-brand-600">Gratuita</span>
            ) : (
              <span className="text-2xs font-semibold text-ink-secondary">{fmt(group.shippingCost)}</span>
            )}
          </div>
        </div>
      ))}

      {/* Totals */}
      <div className="pt-3 mt-2 border-t border-ink-faint/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-ink-tertiary">Prodotti ({cart.length})</span>
          <span className="text-xs text-ink font-medium">{fmt(itemsTotal)}</span>
        </div>
        {hasKnownShipping && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-tertiary">Spedizione</span>
            <span className={`text-xs font-semibold ${shippingTotal === 0 ? "text-brand-600" : "text-ink-secondary"}`}>
              {shippingTotal === 0 ? "Gratuita" : fmt(shippingTotal)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <button onClick={onClear} className="text-xs text-ink-tertiary hover:text-red-500 transition-colors font-medium">
            Svuota
          </button>
          <div className="text-right">
            <p className="text-2xs text-ink-tertiary uppercase tracking-wide font-bold">Totale</p>
            <p className="price-tag text-xl text-brand-600 leading-none mt-0.5">{fmt(grandTotal)}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CartPanel({ cart, onRemove, onClear }: CartPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (cart.length === 0) return null;

  const groups = groupByShop(cart);
  const itemsTotal = cart.reduce((s, i) => s + i.price, 0);
  const shippingTotal = groups.reduce((s, g) => s + (g.shippingCost ?? 0), 0);
  const grandTotal = itemsTotal + shippingTotal;

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block mt-4 card overflow-hidden animate-fade-in">
        <div className="px-5 py-3 bg-brand-50 border-b border-brand-100 flex items-center gap-2">
          <CartIcon className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-bold text-brand-900 flex-1">Carrello</span>
          <span className="text-2xs font-bold bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        </div>
        <div className="px-5 py-2 pb-4">
          <CartBody cart={cart} onRemove={onRemove} onClear={onClear} />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        {sheetOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={() => setSheetOpen(false)} />
        )}
        {sheetOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-elevated animate-slide-up">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-faint" />
            </div>
            <div className="px-5 py-3 border-b border-ink-faint/30 flex items-center gap-2">
              <CartIcon className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-ink flex-1">Carrello</span>
              <span className="text-2xs font-bold bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
              <button onClick={() => setSheetOpen(false)} className="ml-1 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface transition-colors text-ink-tertiary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-2 pb-8 max-h-[60vh] overflow-y-auto pb-safe">
              <CartBody cart={cart} onRemove={onRemove} onClear={onClear} />
            </div>
          </div>
        )}

        {/* Sticky bottom bar — above bottom nav */}
        <div className="fixed left-4 right-4 z-40 pb-safe" style={{ bottom: "calc(var(--bottom-nav-h) + 8px)" }}>
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-brand-600 text-white rounded-2xl px-5 py-3.5 flex items-center gap-3
              shadow-[0_8px_28px_rgba(26,127,75,0.4)] active:scale-[0.98] transition-transform"
          >
            <CartIcon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left font-semibold text-sm">
              {cart.length} {cart.length === 1 ? "prodotto" : "prodotti"}
            </span>
            <span className="price-tag text-base">{fmt(grandTotal)}</span>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
