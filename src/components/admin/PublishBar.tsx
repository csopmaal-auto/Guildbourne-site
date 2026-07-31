"use client";

/**
 * The publish workflow: shows what's waiting on the draft branch, with
 * Publish (merge → build) and Discard (reset draft) behind confirm dialogs.
 */
import { useState } from "react";
import { CloudUpload, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCmsStatus } from "./StatusProvider";

export function PublishBar() {
  const { status, refresh } = useCmsStatus();
  const [confirm, setConfirm] = useState<"publish" | "discard" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!status || status.mode !== "github") return null;
  if (status.pending === 0 && !message) return null;

  const run = async (action: "publish" | "discard") => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${action}`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(body.error ?? `${action} failed.`);
        return;
      }
      setMessage(
        action === "publish"
          ? body.published
            ? `Published ${body.count} change${body.count === 1 ? "" : "s"} — the site will rebuild in a minute or two.`
            : (body.message ?? "Nothing to publish.")
          : "Drafts discarded.",
      );
      await refresh();
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  return (
    <div className="rounded-lg border border-gold/40 bg-gold/10 p-4">
      {status.pending > 0 ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold">
              {status.pending} change{status.pending === 1 ? "" : "s"} ready to
              publish
            </p>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setConfirm("discard")}
              >
                <RotateCcw className="size-3.5" /> Discard
              </Button>
              <Button size="sm" disabled={busy} onClick={() => setConfirm("publish")}>
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CloudUpload className="size-3.5" />
                )}
                Publish
              </Button>
            </div>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {status.items.map((item) => (
              <li
                key={item.file}
                className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {message ? <p className="mt-2 text-sm text-bronze">{message}</p> : null}

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm === "publish" ? "Publish to the live site?" : "Discard all drafts?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "publish"
                ? "Your saved changes will be merged to the production branch and the site will rebuild. This usually takes a minute or two."
                : "All unpublished changes will be permanently removed and the draft will be reset to match the live site."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant={confirm === "discard" ? "destructive" : "default"}
              disabled={busy}
              onClick={() => confirm && void run(confirm)}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {confirm === "publish" ? "Publish now" : "Discard drafts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
