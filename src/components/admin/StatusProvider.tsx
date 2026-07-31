"use client";

/**
 * Draft-status context: how many changes are saved-but-unpublished, which
 * files, and which storage mode the CMS is running in. Refetches on focus
 * and after every save (editors call `refresh()`).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CmsStatus = {
  mode: "github" | "local" | "unconfigured";
  pending: number;
  items: { file: string; label: string }[];
  error?: string;
};

type StatusContextValue = {
  status: CmsStatus | null;
  refresh: () => Promise<void>;
};

const StatusContext = createContext<StatusContextValue>({
  status: null,
  refresh: async () => {},
});

export function useCmsStatus(): StatusContextValue {
  return useContext(StatusContext);
}

export function StatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CmsStatus | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/status");
      const data = await res.json();
      if (!res.ok) {
        setStatus((prev) => ({
          mode: prev?.mode ?? "github",
          pending: prev?.pending ?? 0,
          items: prev?.items ?? [],
          error: data.error ?? "Could not load draft status.",
        }));
        return;
      }
      setStatus({ mode: data.mode, pending: data.pending, items: data.items });
    } catch {
      setStatus((prev) => prev ?? { mode: "github", pending: 0, items: [], error: "offline" });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <StatusContext.Provider value={{ status, refresh }}>
      {children}
    </StatusContext.Provider>
  );
}
