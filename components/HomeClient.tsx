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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("spesasmart_reload");
      if (!raw) return;
      localStorage.removeItem("spesasmart_reload");
      const { products: saved } = JSON.parse(raw) as { products: string[] };
      if (!Array.isArray(saved) || saved.length === 0) return;

      setProducts(saved);
      setProductResults(saved.map((p) => ({ product: p, offers: [], loading: true })));

      saved.forEach(async (product) => {
        try {
          const data = await fetchProduct(product);
          setProductResults((prev) =>
            prev.map((r) =>
              r.product === product ? { ...r, offers: data.offers ?? [], loading: false } : r
            )
          );
        } catch {
          setProductResults((prev) =>
            prev.map((r) =>
              r.product === product ? { ...r, loading: false, error: "Errore di rete" } : r
            )
          );
        }
      });
    } catch {}
  }, []);

  const handleSearch = async (product: string) => {
    setProducts((prev) => [...prev, product]);
    setProductResults((prev) => [...prev, { product, offers: [], loading: true }]);
    setLoadingLabel(`Cerco "${product}"…`);

    try {
      const data = await fetchProduct(product);
      setProductResults((prev) =>
        prev.map((r) =>
          r.product === product ? { ...r, offers: data.offers ?? [], loading: false } : r
        )
      );
    } catch {
      setProductResults((prev) =>
        prev.map((r) =>
          r.product === product ? { ...r, loading: false, error: "Errore di rete" } : r
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
    <div className="min-h-screen">
      {/* Loading banner */}
      {loadingLabel && (
        <div className="bg-brand-600 text-white text-sm py-2.5 px-4 flex items-center justify-center gap-2.5 animate-fade-in">
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="font-medium">{loadingLabel}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-5 pt-4 sm:pt-5">
        {/* Welcome text — only when empty */}
        {products.length === 0 && (
          <div className="mb-4 animate-fade-up">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Confronta prezzi,<br />
              <span className="text-brand-600">risparmia davvero</span>
            </h1>
            <p className="text-ink-secondary text-sm mt-2 max-w-md leading-relaxed">
              Aggiungi i prodotti che vuoi comprare — troviamo il negozio
              più conveniente, spedizione inclusa.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[380px_1fr] lg:gap-5 lg:items-start">
          {/* Left column */}
          <div className="lg:sticky lg:top-[72px]">
            <SearchForm
              products={products}
              productResults={productResults}
              onSearch={handleSearch}
              onRemove={handleRemove}
              onReset={handleReset}
              onSave={handleSave}
            />
            <CartPanel cart={cart} onRemove={handleCartRemove} onClear={handleCartClear} />
          </div>

          {/* Right column */}
          <div className="min-w-0">
            <ResultsTable
              productResults={productResults}
              cart={cart}
              onCartAdd={handleCartAdd}
              onCartRemove={handleCartRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
