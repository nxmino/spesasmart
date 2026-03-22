"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ProductResult } from "@/types";

interface SearchFormProps {
  products: string[];
  productResults: ProductResult[];
  onSearch: (product: string) => void;
  onRemove: (product: string) => void;
  onReset: () => void;
  onSave: () => void;
  onShare: () => void;
  shareFeedback: boolean;
}

export default function SearchForm({
  products,
  productResults,
  onSearch,
  onRemove,
  onReset,
  onSave,
  onShare,
  shareFeedback,
}: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data.filter((s: string) => !products.includes(s)) : []);
      }
    } catch { setSuggestions([]); }
  }, [products]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(query.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  const submit = (value?: string) => {
    const v = (value ?? query).trim().toLowerCase();
    if (!v || products.includes(v)) return;
    onSearch(v);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIdx(-1);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setShowSuggestions(false); return; }
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") { e.preventDefault(); submit(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); activeIdx >= 0 ? submit(suggestions[activeIdx]) : submit(); }
  };

  const handleSave = () => {
    onSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="card p-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink">Lista della spesa</h2>
        {products.length > 0 && (
          <span className="text-2xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            {products.length} {products.length === 1 ? "prodotto" : "prodotti"}
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Cerca un prodotto…"
              className="input-field pl-10 pr-4"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setActiveIdx(-1); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
              onKeyDown={handleKey}
            />
          </div>
          <button onClick={() => submit()} disabled={!query.trim()} className="btn-primary shrink-0 px-4 py-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 mt-2 inset-x-0 bg-white rounded-2xl shadow-elevated border border-ink-faint/30 overflow-hidden animate-scale-in">
            {suggestions.map((s, i) => (
              <button
                key={s}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  i === activeIdx ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-surface"
                }`}
                onMouseDown={() => submit(s)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {products.map((p) => {
            const result = productResults.find((r) => r.product === p);
            const isLoading = result?.loading;
            const hasError = result?.error;
            const isDone = result && !result.loading && !result.error;

            return (
              <div
                key={p}
                className={
                  isLoading ? "chip-loading" : hasError ? "chip-error" : isDone ? "chip-success" : "chip-default"
                }
              >
                {isLoading && (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {isDone && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {hasError && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{p}</span>
                <button onClick={() => onRemove(p)} className="ml-0.5 -mr-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {products.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            {savedFeedback ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Salvato
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                Salva ricerca
              </>
            )}
          </button>
          <button
            onClick={onShare}
            title="Copia link da condividere"
            className="btn-secondary px-3 flex items-center justify-center gap-1.5 text-sm"
          >
            {shareFeedback ? (
              <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
            )}
          </button>
          <button onClick={onReset} className="btn-secondary px-3 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
