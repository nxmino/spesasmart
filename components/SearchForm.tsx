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
}

export default function SearchForm({
  products,
  productResults,
  onSearch,
  onRemove,
  onReset,
  onSave,
}: SearchFormProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasResults = productResults.some((r) => r.offers.length > 0);
  const isAnyLoading = productResults.some((r) => r.loading);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 400);
  };

  const addProduct = (product: string) => {
    const trimmed = product.trim();
    if (!trimmed || products.includes(trimmed)) return;
    onSearch(trimmed);
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
      return;
    }
    if (!showDropdown) {
      if (e.key === "Enter") addProduct(input);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      highlightedIndex >= 0 ? addProduct(suggestions[highlightedIndex]) : addProduct(input);
    }
  };

  const handleSave = () => {
    onSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="card p-5 sm:p-6 flex flex-col gap-4">
      {/* Header card */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          Prodotti da cercare
        </h2>
        {products.length > 0 && (
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            {products.length} {products.length === 1 ? "prodotto" : "prodotti"}
          </span>
        )}
      </div>

      {/* Input + pulsante */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Aggiungi prodotto..."
              autoComplete="off"
              className="input-base pl-9 pr-3"
            />
          </div>
          <button
            onClick={() => addProduct(input)}
            disabled={!input.trim()}
            className="btn-primary px-4 shrink-0 flex items-center gap-1.5"
            aria-label="Aggiungi prodotto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Aggiungi</span>
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); addProduct(s); }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                  i === highlightedIndex
                    ? "bg-green-50 text-green-800"
                    : "text-slate-700 hover:bg-slate-50"
                } ${i > 0 ? "border-t border-slate-100" : ""}`}
              >
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips prodotti */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {products.map((p) => {
            const result = productResults.find((r) => r.product === p);
            const loading = result?.loading ?? false;
            const hasError = !!result?.error;
            const done = !loading && !hasError && (result?.offers.length ?? 0) > 0;

            return (
              <span
                key={p}
                className={`group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200 animate-fade-in ${
                  hasError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : loading
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : done
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {loading ? (
                  <svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : done ? (
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd" />
                  </svg>
                ) : hasError ? (
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd" />
                  </svg>
                ) : null}
                <span className="max-w-[140px] truncate">{p}</span>
                <button
                  onClick={() => onRemove(p)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors shrink-0"
                  aria-label={`Rimuovi ${p}`}
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Divider */}
      {products.length > 0 && <div className="border-t border-slate-100" />}

      {/* Azioni */}
      <div className="flex gap-2.5">
        <button
          onClick={handleSave}
          disabled={!hasResults || isAnyLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200 active:scale-95
            ${savedFeedback
              ? "bg-green-700 text-white"
              : "btn-primary"
            }
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`}
        >
          {savedFeedback ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd" />
              </svg>
              Salvato!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Salva ricerca
            </>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={products.length === 0}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Nuova
        </button>
      </div>
    </div>
  );
}
