import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import type { FocusSession } from "@/types/task";

const FOCUS_SESSIONS_KEY = "tuonta.focus-sessions.v1";

interface FocusContextValue {
  sessions: FocusSession[];
  loading: boolean;
  addSession: (session: Omit<FocusSession, "id" | "completedAt">) => void;
  resetSessions: () => void;
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

function restoreSessions(value: string | null): FocusSession[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FocusSession => {
      if (!item || typeof item !== "object") return false;
      const session = item as Record<string, unknown>;
      return typeof session.id === "string" && typeof session.taskId === "string" && typeof session.taskTitle === "string" && typeof session.minutes === "number" && typeof session.completedAt === "string";
    });
  } catch {
    return [];
  }
}

export function FocusProvider({ children }: PropsWithChildren) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(FOCUS_SESSIONS_KEY)
      .then((stored) => setSessions(restoreSessions(stored)))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(sessions)).catch(() => undefined);
  }, [loading, sessions]);

  const addSession = useCallback((session: Omit<FocusSession, "id" | "completedAt">) => {
    setSessions((current) => [{ ...session, id: `focus-${Date.now()}`, completedAt: new Date().toISOString() }, ...current]);
  }, []);
  const resetSessions = useCallback(() => setSessions([]), []);
  const value = useMemo(() => ({ sessions, loading, addSession, resetSessions }), [sessions, loading, addSession, resetSessions]);

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) throw new Error("useFocus must be used inside FocusProvider");
  return context;
}
