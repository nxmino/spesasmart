"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Piccolo delay per non mostrare subito al caricamento
      setTimeout(() => setVisible(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || !visible) return null;

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setVisible(false);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 flex justify-center transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl w-full max-w-sm">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-lg shrink-0">
          📲
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Installa l&apos;app</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-tight">
            Usala come app nativa sul telefono
          </p>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          disabled={installing}
          className="shrink-0 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
            px-3.5 py-1.5 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {installing ? "..." : "Installa →"}
        </button>

        {/* Dismiss */}
        <button
          onClick={() => setVisible(false)}
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
