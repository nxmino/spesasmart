"use client";

import { useLocalStorage } from "./useLocalStorage";
import type { Session, AggregatedResults } from "@/types";

export function useSessions() {
  const [sessions, setSessions] = useLocalStorage<Session[]>(
    "spesasmart_sessions",
    []
  );

  const FREE_SESSION_CAP = 10;

  const saveSession = (
    products: string[],
    results: AggregatedResults,
    label?: string
  ): void => {
    const now = new Date();
    const sessionLabel = label ?? `Ricerca del ${now.toLocaleDateString("it-IT")} ${now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;

    const newSession: Session = {
      id: crypto.randomUUID(),
      label: sessionLabel,
      createdAt: now.toISOString(),
      products,
      results,
    };

    setSessions((prev) => [newSession, ...prev].slice(0, FREE_SESSION_CAP));
  };

  const deleteSession = (id: string): void => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return { sessions, saveSession, deleteSession };
}
