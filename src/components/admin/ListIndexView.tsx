"use client";

/**
 * List-collection index: draft-aware entry list with create + delete.
 * The list loads through the admin API (draft branch), so new entries appear
 * before publishing.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EditorError,
  EditorHeader,
  EditorLoading,
} from "@/components/admin/EditorChrome";
import { useCmsStatus } from "@/components/admin/StatusProvider";
import { publicPathFor } from "@/lib/cms/editorConfig";
import { getCollection } from "@/lib/cms/registry";

type Entry = Record<string, unknown> & { slug: string };

/** Takes only the collection id — registry entries hold functions that can't
 *  cross the server → client boundary. */
export function ListIndexView({ collectionId }: { collectionId: string }) {
  const collection = getCollection(collectionId)!;
  const router = useRouter();
  const { refresh } = useCmsStatus();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Entry | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/content/${collection.id}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not load entries.");
      setEntries(Array.isArray(body.data) ? body.data : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load entries.");
    }
  }, [collection.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/content/${collection.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(body.error ?? "Could not create the entry.");
        return;
      }
      void refresh();
      router.push(`/admin/edit/${collection.id}/${body.slug}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(
        `/api/admin/content/${collection.id}?slug=${encodeURIComponent(deleting.slug)}`,
        { method: "DELETE" },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(body.error ?? "Could not delete the entry.");
        return;
      }
      setDeleting(null);
      void refresh();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const primary = collection.listFields?.primary ?? "title";
  const secondary = collection.listFields?.secondary;

  if (loadError) return <EditorError message={loadError} />;
  if (!entries) return <EditorLoading />;

  return (
    <div>
      <EditorHeader
        title={collection.label}
        description={collection.description}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      {actionError ? (
        <p className="mb-3 text-sm text-destructive">{actionError}</p>
      ) : null}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nothing here yet — create the first entry.
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border bg-card">
          {entries.map((entry) => {
            const publicPath = publicPathFor(collection.id, entry.slug);
            return (
              <li key={entry.slug} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/edit/${collection.id}/${entry.slug}`}
                    className="truncate text-sm font-semibold hover:text-bronze focus-gold rounded-sm"
                  >
                    {String(entry[primary] ?? entry.slug)}
                  </Link>
                  {secondary && entry[secondary] ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {String(entry[secondary])}
                    </p>
                  ) : null}
                </div>
                {publicPath && publicPath.includes(entry.slug) ? (
                  <Button asChild variant="ghost" size="icon-sm" aria-label="View on site">
                    <Link href={publicPath} target="_blank">
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                  <Link href={`/admin/edit/${collection.id}/${entry.slug}`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(entry)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New {collection.label.replace(/s$/, "").toLowerCase()}</DialogTitle>
            <DialogDescription>
              Give it a title — the web address is generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void create()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={busy || !title.trim()} onClick={() => void create()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete “{String(deleting?.[primary] ?? deleting?.slug ?? "")}”?
            </DialogTitle>
            <DialogDescription>
              {`This removes the entry from the ${collection.label.toLowerCase()} collection. `}
              You can publish or discard the change afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void remove()} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
