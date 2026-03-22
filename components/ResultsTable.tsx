"use client";

import { useState, useMemo, useEffect } from "react";
import type { ProductResult, ShopRow, CartItem } from "@/types";
import { aggregateResults } from "@/lib/aggregate";

interface ResultsTableProps {
  productResults: ProductResult[];
  cart?: CartItem[];
  onCartAdd?: (item: CartItem) => void;
  onCartRemove?: (product: string) => void;
}

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " \u20AC";
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-3 px-4 py-4">
      <div className="w-8 h-8 bg-ink-faint/40 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-ink-faint/40 rounded-lg w-28" />
        <div className="h-2.5 bg-ink-faint/30 rounded-lg w-16" />
      </div>
      <div className="h-5 bg-ink-faint/40 rounded-lg w-16" />
    </div>
  );
}

function ShopAccordionRow({
  row,
  rank,
  totalProducts,
  cart,
  onCartAdd,
  onCartRemove,
}: {
  row: ShopRow;
  rank: number;
  totalProducts: number;
  cart?: CartItem[];
  onCartAdd?: (item: CartItem) => void;
  onCartRemove?: (product: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isBest = rank === 0;
  const cartCountForShop = cart?.filter((c) => c.shopKey === row.shopKey).length ?? 0;

  return (
    <div className={`animate-fade-in ${isBest ? "bg-brand-50/50" : ""}`}>
      {/* Main row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors"
      >
        {/* Rank badge */}
        {isBest ? (
          <span className="shrink-0 w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        ) : (
          <span className="shrink-0 w-8 h-8 rounded-xl bg-surface border border-ink-faint/50 flex items-center justify-center text-xs font-bold text-ink-secondary">
            {rank + 1}
          </span>
        )}

        {/* Shop info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm truncate ${isBest ? "text-brand-900" : "text-ink"}`}>
              {row.shop}
            </span>
            {isBest && (
              <span className="shrink-0 hidden sm:inline text-2xs font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full">
                Migliore
              </span>
            )}
            {cartCountForShop > 0 && (
              <span className="shrink-0 text-2xs font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
                {cartCountForShop} nel carrello
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-2xs font-medium ${row.foundCount === totalProducts ? "text-brand-600" : "text-amber-600"}`}>
              {row.foundCount}/{totalProducts} trovati
            </span>
          </div>
        </div>

        {/* Shipping column */}
        <div className="shrink-0 text-right w-20 hidden sm:block">
          {row.shippingCost === undefined ? (
            <span className="text-2xs text-ink-faint">&mdash;</span>
          ) : row.shippingCost === 0 ? (
            <span className="text-2xs font-semibold text-brand-600">Gratuita</span>
          ) : (
            <span className="text-2xs font-semibold text-ink-secondary">{fmt(row.shippingCost)}</span>
          )}
        </div>

        {/* Price */}
        <div className={`shrink-0 text-right ${isBest ? "text-brand-700" : "text-ink"}`}>
          <span className="price-tag text-base">{fmt(row.subtotal)}</span>
          {/* Shipping sotto il prezzo su mobile */}
          <div className="sm:hidden mt-0.5">
            {row.shippingCost === undefined ? null : row.shippingCost === 0 ? (
              <span className="text-2xs font-semibold text-brand-600">Sped. gratuita</span>
            ) : (
              <span className="text-2xs text-ink-tertiary">+ sped. {fmt(row.shippingCost)}</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg className={`w-4 h-4 text-ink-tertiary shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Accordion */}
      {open && (
        <div className="px-4 pb-4 flex flex-col animate-fade-in">
          {row.items.map((item) => {
            const inCart = cart?.some((c) => c.product === item.product && c.shopKey === row.shopKey) ?? false;

            return item.found ? (
              <div key={item.product} className={`py-3 border-t border-ink-faint/30 first:border-0 ${inCart ? "bg-brand-50/40 -mx-4 px-4 rounded-2xl" : ""}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-ink-tertiary text-2xs font-bold uppercase tracking-wider">{item.product}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="price-tag text-sm text-ink">{fmt(item.price!)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inCart) {
                          onCartRemove?.(item.product);
                        } else {
                          onCartAdd?.({
                            product: item.product,
                            title: item.title!,
                            shop: row.shop,
                            shopKey: row.shopKey,
                            price: item.price!,
                            affiliateUrl: item.affiliateUrl ?? "",
                            shipping: item.shipping,
                            shippingCost: item.shippingCost,
                          });
                        }
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
                        inCart
                          ? "bg-brand-100 text-brand-700 hover:bg-red-50 hover:text-red-600"
                          : "bg-surface text-ink-secondary border border-ink-faint/50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200"
                      }`}
                    >
                      {inCart ? "Aggiunto" : "+ Carrello"}
                    </button>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-ink-secondary text-sm leading-snug flex-1 min-w-0 truncate">{item.title}</p>
                  {item.affiliateUrl && (
                    <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-brand-600 hover:text-brand-800 font-semibold text-xs transition-colors">
                      Vai al sito
                    </a>
                  )}
                </div>
                {item.shipping && (
                  <p className={`text-xs mt-1 ${item.shippingCost === 0 ? "text-brand-600 font-medium" : "text-ink-tertiary"}`}>
                    {item.shippingCost === 0 ? "Spedizione gratuita" : item.shipping}
                  </p>
                )}
              </div>
            ) : (
              <div key={item.product} className="flex items-center justify-between py-3 border-t border-ink-faint/30 first:border-0">
                <div>
                  <p className="text-ink-tertiary text-2xs font-bold uppercase tracking-wider mb-0.5">{item.product}</p>
                  <p className="text-ink-tertiary italic text-sm">Non disponibile</p>
                </div>
                <span className="text-ink-faint text-xs">&mdash;</span>
              </div>
            );
          })}

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-ink-faint/40 flex items-center justify-between">
            <span className="text-xs text-ink-tertiary">
              {row.foundCount} {row.foundCount === 1 ? "prodotto" : "prodotti"} su {row.totalProducts}
            </span>
            <span className={`price-tag text-base ${isBest ? "text-brand-700" : "text-ink"}`}>{fmt(row.subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsTable({ productResults, cart, onCartAdd, onCartRemove }: ResultsTableProps) {
  const isAnyLoading = productResults.some((r) => r.loading);
  const hasAny = productResults.length > 0;
  const completedCount = productResults.filter((r) => !r.loading).length;
  const rows = useMemo(() => aggregateResults(productResults), [productResults]);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Lock body scroll when expanded on mobile
  useEffect(() => {
    if (mobileExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileExpanded]);

  if (!hasAny) {
    return (
      <div className="card p-10 sm:p-14 flex flex-col items-center justify-center gap-4 text-center min-h-[260px]">
        <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center">
          <svg className="w-7 h-7 text-ink-tertiary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <div>
          <p className="text-ink font-semibold text-sm">Aggiungi prodotti per iniziare</p>
          <p className="text-ink-tertiary text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
            Cerca un prodotto nel campo a sinistra — confronteremo i prezzi su tutti i negozi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden flex flex-col lg:h-[calc(100svh-92px)] ${mobileExpanded ? "fixed inset-x-0 top-14 bottom-0 z-50 rounded-b-none" : "max-h-[55vh] lg:max-h-none"}`}>
      {/* Drag handle — mobile only */}
      <button
        onClick={() => setMobileExpanded((v) => !v)}
        className="lg:hidden flex justify-center pt-2.5 pb-1 shrink-0"
        aria-label={mobileExpanded ? "Riduci" : "Espandi"}
      >
        <div className="w-10 h-1 rounded-full bg-ink-faint" />
      </button>

      {/* Header */}
      <div className="px-4 py-3 border-b border-ink-faint/30 flex items-center gap-2 shrink-0">
        <h2 className="font-bold text-ink text-sm flex-1">
          Confronto negozi
          {isAnyLoading && completedCount > 0 && (
            <span className="ml-2 text-ink-tertiary font-normal text-xs">({completedCount}/{productResults.length})</span>
          )}
        </h2>
        <div className="hidden sm:flex items-center text-2xs text-ink-tertiary font-semibold uppercase tracking-wider">
          <span className="w-20 text-right">Sped.</span>
          <span className="w-20 text-right pr-6">Totale</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Skeleton */}
        {isAnyLoading && rows.length === 0 && (
          <div className="divide-y divide-ink-faint/20">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {/* Results */}
        {rows.length > 0 && (
          <div className="divide-y divide-ink-faint/20">
            {rows.map((row, i) => (
              <ShopAccordionRow
                key={row.shopKey}
                row={row}
                rank={i}
                totalProducts={completedCount}
                cart={cart}
                onCartAdd={onCartAdd}
                onCartRemove={onCartRemove}
              />
            ))}
            {isAnyLoading && <div className="opacity-40"><SkeletonRow /></div>}
          </div>
        )}

        {/* Empty */}
        {!isAnyLoading && rows.length === 0 && hasAny && (
          <div className="p-10 text-center text-ink-tertiary text-sm">
            Nessun risultato trovato per i prodotti inseriti.
          </div>
        )}
      </div>
    </div>
  );
}
