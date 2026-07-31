"use client";

/** Shared editor page chrome: header, loading/error states and the save bar. */
import type { ReactNode } from "react";
import { Check, Loader2, RefreshCw, Save, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SaveState } from "@/hooks/useEditor";

export function EditorHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EditorLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function EditorError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
      <p>{message}</p>
    </div>
  );
}

export function SaveBar({
  saveState,
  dirty,
  onSave,
  onReload,
}: {
  saveState: SaveState;
  dirty: boolean;
  onSave: () => void;
  onReload: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 mt-8 -mx-4 border-t bg-ivory/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saveState.kind === "saving" || !dirty}>
          {saveState.kind === "saving" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saveState.kind === "saving" ? "Saving…" : "Save"}
        </Button>
        {saveState.kind === "saved" && !dirty ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-bronze">
            <Check className="size-4" /> Saved
          </span>
        ) : null}
        {dirty && saveState.kind === "idle" ? (
          <span className="text-sm text-muted-foreground">Unsaved changes</span>
        ) : null}
        {saveState.kind === "stale" ? (
          <span className="flex items-center gap-2 text-sm text-destructive">
            This content changed since you loaded it.
            <Button size="sm" variant="outline" onClick={onReload}>
              <RefreshCw className="size-3.5" /> Reload
            </Button>
          </span>
        ) : null}
        {saveState.kind === "error" ? (
          <span className="text-sm text-destructive">{saveState.message}</span>
        ) : null}
      </div>
      {saveState.kind === "invalid" ? (
        <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-sm font-semibold text-destructive">
            Not saved — please fix:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            {saveState.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
