"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iOS Safari (exclude Chrome on iOS and Firefox on iOS)
  return (
    /iPad|iPhone|iPod/.test(ua) &&
    /WebKit/.test(ua) &&
    !/CriOS|FxiOS/.test(ua)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

// ── Icona condivisione iOS ────────────────────────────────────────────────────
function ShareIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 inline-block shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M8 12H3v9h18v-9h-5M12 3v12M9 6l3-3 3 3" />
    </svg>
  );
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"hidden" | "android" | "ios">("hidden");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // già installata

    if (detectIOS()) {
      const dismissed = sessionStorage.getItem("pwa_ios_dismissed");
      if (!dismissed) setTimeout(() => setMode("ios"), 2500);
      return;
    }

    // Chrome / Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setMode("android"), 2500);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setMode("hidden");
      }
    } finally {
      setInstalling(false);
    }
  };

  const dismissIOS = () => {
    sessionStorage.setItem("pwa_ios_dismissed", "1");
    setMode("hidden");
  };

  if (mode === "hidden") return null;

  // ── Banner iOS ─────────────────────────────────────────────────────────────
  if (mode === "ios") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[60] flex justify-center animate-fade-in">
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-2xl w-full max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-base shrink-0 mt-0.5">
            📲
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">Installa SpesaSmart</p>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Tocca{" "}
              <span className="inline-flex items-center gap-1 bg-slate-700 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded mx-0.5">
                <ShareIcon /> Condividi
              </span>{" "}
              poi{" "}
              <span className="text-white font-semibold">
                &ldquo;Aggiungi a schermata Home&rdquo;
              </span>
            </p>
          </div>
          <button
            onClick={dismissIOS}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
            aria-label="Chiudi"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ── Banner Android/Chrome ─────────────────────────────────────────────────
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] flex justify-center animate-fade-in">
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl w-full max-w-sm">
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-lg shrink-0">
          📲
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Installa l&apos;app</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-tight">
            Usala come app nativa sul telefono
          </p>
        </div>
        <button
          onClick={handleInstallAndroid}
          disabled={installing}
          className="shrink-0 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
            px-3.5 py-1.5 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {installing ? "..." : "Installa →"}
        </button>
        <button
          onClick={() => setMode("hidden")}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Chiudi"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
