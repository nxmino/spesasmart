"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import ResultsTable from "@/components/ResultsTable";
import CartPanel from "@/components/CartPanel";
import { useSessions } from "@/hooks/useSessions";
import { aggregateResults } from "@/lib/aggregate";
import type { ProductResult, CartItem } from "@/types";

async function fetchProduct(product: string) {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function HomeClient() {
  const [products, setProducts] = useState<string[]>([]);
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { saveSession } = useSessions();

  // Reload da storico
  useEffect(() => {
    try {
      const raw = localStorage.getItem("spesasmart_reload");
      if (!raw) return;
      localStorage.removeItem("spesasmart_reload");
      const { products: saved } = JSON.parse(raw) as { products: string[] };
      if (!Array.isArray(saved) || saved.length === 0) return;

      setProducts(saved);
      setProductResults(
        saved.map((p) => ({ product: p, offers: [], loading: true }))
      );

      saved.forEach(async (product) => {
        try {
          const data = await fetchProduct(product);
          setProductResults((prev) =>
            prev.map((r) =>
              r.product === product
                ? { ...r, offers: data.offers ?? [], loading: false }
                : r
            )
          );
        } catch {
          setProductResults((prev) =>
            prev.map((r) =>
              r.product === product
                ? { ...r, loading: false, error: "Errore di rete" }
                : r
            )
          );
        }
      });
    } catch {}
  }, []);

  const handleSearch = async (product: string) => {
    setProducts((prev) => [...prev, product]);
    setProductResults((prev) => [
      ...prev,
      { product, offers: [], loading: true },
    ]);
    setLoadingLabel(`Cerco "${product}" e trovo i link dei negozi…`);

    try {
      const data = await fetchProduct(product);
      setProductResults((prev) =>
        prev.map((r) =>
          r.product === product
            ? { ...r, offers: data.offers ?? [], loading: false }
            : r
        )
      );
    } catch {
      setProductResults((prev) =>
        prev.map((r) =>
          r.product === product
            ? { ...r, loading: false, error: "Errore di rete" }
            : r
        )
      );
    } finally {
      setLoadingLabel(null);
    }
  };

  const handleRemove = (product: string) => {
    setProducts((prev) => prev.filter((p) => p !== product));
    setProductResults((prev) => prev.filter((r) => r.product !== product));
    setCart((prev) => prev.filter((c) => c.product !== product));
  };

  const handleReset = () => {
    setProducts([]);
    setProductResults([]);
    setCart([]);
  };

  const handleSave = () => {
    saveSession(products, aggregateResults(productResults));
  };

  const handleCartAdd = (item: CartItem) => {
    setCart((prev) => {
      const filtered = prev.filter((c) => c.product !== item.product);
      return [...filtered, item];
    });
  };

  const handleCartRemove = (product: string) => {
    setCart((prev) => prev.filter((c) => c.product !== product));
  };

  const handleCartClear = () => setCart([]);

  return (
    <div>
      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        <div
          aria-hidden
          className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full bg-green-100/70 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-50 blur-2xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-32 bg-green-50/60 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-4 bg-white/80 backdrop-blur-sm border border-green-200 shadow-sm text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full animate-fade-up">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Prezzi in tempo reale
          </div>

          <h1 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight max-w-2xl animate-fade-up-delay-1">
            Compara prezzi,{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-green-600">risparmia davvero</span>
              <svg
                aria-hidden
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 300 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q75 0 150 4 Q225 8 300 2"
                  stroke="#86efac"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-[15px] mt-3 max-w-lg leading-relaxed animate-fade-up-delay-2">
            Aggiungi i prodotti che vuoi comprare — troviamo il negozio più{" "}
            <strong className="text-slate-700 font-semibold">conveniente</strong>,
            spedizione inclusa.
          </p>

          <div className="flex flex-wrap gap-2 mt-5 animate-fade-up-delay-3">
            {[
              { icon: "🔍", label: "Ricerca in tempo reale" },
              { icon: "🛒", label: "Carrello virtuale" },
              { icon: "💾", label: "Storico ricerche" },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white/90 border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-3 py-1.5 rounded-full"
              >
                <span>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOADING BANNER ── */}
      {loadingLabel && (
        <div className="bg-green-600 text-white text-sm py-2.5 px-4 flex items-center justify-center gap-2.5 animate-fade-in shadow-sm">
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="font-medium">{loadingLabel}</span>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-32 lg:pb-24">
        <div className="flex flex-col gap-4 sm:gap-5 lg:grid lg:grid-cols-[400px_1fr] lg:gap-6 lg:items-start">

          {/* Left column — SearchForm + CartPanel sticky su desktop */}
          <div className="lg:sticky lg:top-20">
            <SearchForm
              products={products}
              productResults={productResults}
              onSearch={handleSearch}
              onRemove={handleRemove}
              onReset={handleReset}
              onSave={handleSave}
            />

            {products.length === 0 && (
              <div className="mt-3 bg-white rounded-xl border border-dashed border-slate-200 p-4 lg:hidden">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Scrivi un prodotto e premi Invio per aggiungerlo alla lista
                </p>
              </div>
            )}

            {/* Carrello desktop */}
            <CartPanel
              cart={cart}
              onRemove={handleCartRemove}
              onClear={handleCartClear}
            />
          </div>

          {/* Right column — ResultsTable */}
          <div className="min-w-0">
            <ResultsTable
              productResults={productResults}
              cart={cart}
              onCartAdd={handleCartAdd}
              onCartRemove={handleCartRemove}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
