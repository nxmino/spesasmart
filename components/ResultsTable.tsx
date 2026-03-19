"use client";

import { useState, useMemo } from "react";
import type { ProductResult, ShopRow, CartItem } from "@/types";
import { aggregateResults } from "@/lib/aggregate";

interface ResultsTableProps {
  productResults: ProductResult[];
  cart?: CartItem[];
  onCartAdd?: (item: CartItem) => void;
  onCartRemove?: (product: string) => void;
}

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-3 px-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 flex items-center gap-2">
        <div className="h-4 bg-slate-100 rounded-lg w-6" />
        <div className="h-4 bg-slate-100 rounded-lg w-28" />
      </div>
      <div className="h-5 bg-slate-100 rounded-lg w-14 hidden sm:block" />
      <div className="h-5 bg-slate-100 rounded-lg w-20" />
      <div className="h-4 w-4 bg-slate-100 rounded" />
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

  // Quanti prodotti di questo shop sono nel carrello
  const cartCountForShop = cart?.filter((c) => c.shopKey === row.shopKey).length ?? 0;

  return (
    <div
      className={`border-b border-slate-100 last:border-0 animate-fade-in ${
        isBest ? "bg-green-50/60" : "bg-white"
      }`}
    >
      {/* Riga principale */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3.5 flex items-center gap-2 hover:bg-black/[0.02] transition-colors"
      >
        {/* Rank + Nome negozio */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isBest ? (
            <span className="shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          ) : (
            <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
              {rank + 1}
            </span>
          )}
          <span className={`font-medium truncate ${isBest ? "text-green-900" : "text-slate-800"}`}>
            {row.shop}
          </span>
          {isBest && (
            <span className="shrink-0 hidden sm:inline text-xs font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">
              Miglior offerta
            </span>
          )}
          {/* Badge carrello */}
          {cartCountForShop > 0 && (
            <span className="shrink-0 text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCountForShop}
            </span>
          )}
        </div>

        {/* Trovati X/Y */}
        <div className="hidden sm:block w-16 text-center shrink-0">
          <span
            className={`text-sm font-medium ${
              row.foundCount === totalProducts ? "text-green-700" : "text-amber-600"
            }`}
          >
            {row.foundCount}/{totalProducts}
          </span>
        </div>

        {/* Totale */}
        <div
          className={`w-24 text-right font-bold text-base shrink-0 ${
            isBest ? "text-green-700" : "text-slate-800"
          }`}
        >
          {fmt(row.subtotal)}
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion dettaglio */}
      {open && (
        <div className="px-4 pb-4 flex flex-col">
          {row.items.map((item) => {
            const inCart =
              cart?.some((c) => c.product === item.product && c.shopKey === row.shopKey) ?? false;

            return item.found ? (
              <div
                key={item.product}
                className={`py-3 border-t border-slate-100 first:border-0 transition-colors ${
                  inCart ? "bg-green-50/40 -mx-4 px-4 rounded-xl" : ""
                }`}
              >
                {/* Top row: label + price + cart btn */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    {item.product}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-sm text-slate-800">{fmt(item.price!)}</span>
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
                          });
                        }
                      }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                        inCart
                          ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
                          : "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700"
                      }`}
                    >
                      {inCart ? "✓ Aggiunto" : "+ Carrello"}
                    </button>
                  </div>
                </div>
                {/* Bottom row: title + link */}
                <div className="flex items-end justify-between gap-3">
                  <p className="text-slate-600 text-sm leading-snug flex-1 min-w-0 truncate">
                    {item.title}
                  </p>
                  {item.affiliateUrl ? (
                    <a
                      href={item.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-green-600 hover:text-green-800 font-semibold whitespace-nowrap text-xs transition-colors"
                    >
                      Vedi sul sito →
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div
                key={item.product}
                className="flex items-center justify-between text-sm py-3 border-t border-slate-100 first:border-0"
              >
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    {item.product}
                  </p>
                  <p className="text-slate-400 italic text-sm">Non disponibile su questo negozio</p>
                </div>
                <span className="text-slate-300 text-xs">—</span>
              </div>
            );
          })}

          {/* Footer riga */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {row.foundCount} {row.foundCount === 1 ? "prodotto" : "prodotti"} su {row.totalProducts}
            </span>
            <span className={`font-bold text-base ${isBest ? "text-green-700" : "text-slate-800"}`}>
              {fmt(row.subtotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsTable({
  productResults,
  cart,
  onCartAdd,
  onCartRemove,
}: ResultsTableProps) {
  const isAnyLoading = productResults.some((r) => r.loading);
  const hasAny = productResults.length > 0;
  const completedCount = productResults.filter((r) => !r.loading).length;

  const rows = useMemo(() => aggregateResults(productResults), [productResults]);

  if (!hasAny) {
    return (
      <div className="card p-10 sm:p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[280px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
          🛒
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-base">
            Aggiungi prodotti per iniziare
          </p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto leading-relaxed">
            Cerca un prodotto nel campo a sinistra — confronteremo i prezzi su tutti i negozi trovati
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
        <h2 className="font-semibold text-slate-700 flex-1 text-sm">
          Confronto prezzi
          {isAnyLoading && completedCount > 0 && (
            <span className="ml-2 text-slate-400 font-normal text-xs">
              ({completedCount}/{productResults.length} caricati)
            </span>
          )}
        </h2>
        <div className="hidden sm:flex items-center text-xs text-slate-400 font-medium">
          <span className="w-16 text-center">Trovati</span>
          <span className="w-24 text-right pr-6">Totale</span>
        </div>
      </div>

      {isAnyLoading && rows.length === 0 && (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      )}

      {rows.length > 0 && (
        <>
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
          {isAnyLoading && (
            <div className="opacity-50">
              <SkeletonRow />
            </div>
          )}
        </>
      )}

      {!isAnyLoading && rows.length === 0 && hasAny && (
        <div className="p-10 text-center text-slate-400 text-sm">
          Nessun risultato trovato per i prodotti inseriti.
        </div>
      )}
    </div>
  );
}
