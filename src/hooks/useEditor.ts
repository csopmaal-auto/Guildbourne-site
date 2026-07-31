"use client";

/**
 * Load → edit local state → validate-and-commit on save.
 * Shared by every object editor and the generic list-entry editor.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useCmsStatus } from "@/components/admin/StatusProvider";

type Data = Record<string, unknown>;

export type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "invalid"; errors: string[] }
  | { kind: "stale" }
  | { kind: "error"; message: string };

type EditorCore = {
  data: Data | null;
  setData: (next: Data) => void;
  loading: boolean;
  loadError: string | null;
  saveState: SaveState;
  dirty: boolean;
  reload: () => Promise<void>;
  save: () => Promise<boolean>;
};

function useEditorCore(
  collectionId: string,
  pickData: (fileData: unknown) => Data | null,
  buildPayload: (data: Data, sha: string | null) => unknown,
): EditorCore {
  const [data, setDataState] = useState<Data | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const baseline = useRef<string>("");
  const { refresh } = useCmsStatus();

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/content/${collectionId}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not load content.");
      const picked = pickData(body.data);
      if (!picked) throw new Error("Entry not found — it may have been deleted.");
      setDataState(picked);
      setSha(body.sha ?? null);
      baseline.current = JSON.stringify(picked);
      setSaveState({ kind: "idle" });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, [collectionId, pickData]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const dirty = data !== null && JSON.stringify(data) !== baseline.current;

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setData = useCallback((next: Data) => {
    setDataState(next);
    setSaveState((s) => (s.kind === "saved" ? { kind: "idle" } : s));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!data) return false;
    setSaveState({ kind: "saving" });
    try {
      const res = await fetch(`/api/admin/content/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(data, sha)),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && Array.isArray(body.errors)) {
        setSaveState({ kind: "invalid", errors: body.errors });
        return false;
      }
      if (res.status === 409) {
        setSaveState({ kind: "stale" });
        return false;
      }
      if (!res.ok) {
        setSaveState({ kind: "error", message: body.error ?? "Save failed." });
        return false;
      }
      baseline.current = JSON.stringify(data);
      setSaveState({ kind: "saved" });
      void refresh();
      return true;
    } catch {
      setSaveState({ kind: "error", message: "Save failed — check your connection." });
      return false;
    }
  }, [buildPayload, collectionId, data, refresh, sha]);

  return { data, setData, loading, loadError, saveState, dirty, reload, save };
}

/** Object collections — edit the whole file. */
export function useObjectEditor(collectionId: string): EditorCore {
  const pick = useCallback(
    (fileData: unknown) => (fileData as Data) ?? null,
    [],
  );
  const payload = useCallback(
    (data: Data, sha: string | null) => ({ data, sha: sha ?? undefined }),
    [],
  );
  return useEditorCore(collectionId, pick, payload);
}

/** List collections — edit one slugged entry, merged by the server. */
export function useEntryEditor(collectionId: string, slug: string) {
  const pick = useCallback(
    (fileData: unknown) => {
      if (!Array.isArray(fileData)) return null;
      return (
        (fileData as Data[]).find((e) => e.slug === slug) ?? null
      );
    },
    [slug],
  );
  const payload = useCallback((data: Data) => ({ entry: data }), []);
  const core = useEditorCore(collectionId, pick, payload);

  const remove = useCallback(async (): Promise<boolean> => {
    const res = await fetch(
      `/api/admin/content/${collectionId}?slug=${encodeURIComponent(slug)}`,
      { method: "DELETE" },
    );
    return res.ok;
  }, [collectionId, slug]);

  return { ...core, remove };
}
