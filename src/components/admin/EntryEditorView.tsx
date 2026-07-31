"use client";

/** The generic list-entry editor (blueprint: /admin/edit/[file]/[slug]). */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldRenderer } from "@/components/admin/FieldRenderer";
import {
  EditorError,
  EditorHeader,
  EditorLoading,
  SaveBar,
} from "@/components/admin/EditorChrome";
import { useCmsStatus } from "@/components/admin/StatusProvider";
import { useEntryEditor } from "@/hooks/useEditor";
import { entryEditors, publicPathFor } from "@/lib/cms/editorConfig";
import { getCollection } from "@/lib/cms/registry";

/** Takes only ids — registry entries hold functions that can't cross the
 *  server → client boundary. */
export function EntryEditorView({
  collectionId,
  slug,
}: {
  collectionId: string;
  slug: string;
}) {
  const collection = getCollection(collectionId)!;
  const fields = entryEditors[collectionId] ?? [];
  const router = useRouter();
  const editor = useEntryEditor(collection.id, slug);
  const { refresh } = useCmsStatus();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const listHref = collection.editPath ?? `/admin/${collection.id}`;
  const publicPath = publicPathFor(collection.id, slug);

  const remove = async () => {
    setBusy(true);
    const ok = await editor.remove();
    setBusy(false);
    if (ok) {
      void refresh();
      router.push(listHref);
    }
  };

  if (editor.loading) return <EditorLoading />;
  if (editor.loadError || !editor.data)
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={listHref}>
            <ArrowLeft className="size-4" /> Back to {collection.label}
          </Link>
        </Button>
        <EditorError message={editor.loadError ?? "Entry not found."} />
      </div>
    );

  const title = String(
    editor.data[collection.listFields?.primary ?? "title"] ?? slug,
  );

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={listHref}>
          <ArrowLeft className="size-4" /> {collection.label}
        </Link>
      </Button>
      <EditorHeader
        title={title}
        description={`/${collection.id}/${slug}`}
        actions={
          <>
            {publicPath && publicPath.includes(slug) ? (
              <Button asChild variant="outline" size="sm">
                <Link href={publicPath} target="_blank">
                  View on site <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/5"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </>
        }
      />
      <div className="space-y-4 rounded-lg border bg-card p-5">
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            data={editor.data!}
            onChange={editor.setData}
          />
        ))}
      </div>
      <SaveBar
        saveState={editor.saveState}
        dirty={editor.dirty}
        onSave={() => void editor.save()}
        onReload={() => void editor.reload()}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{title}”?</DialogTitle>
            <DialogDescription>
              This removes the entry. You can publish or discard the change
              afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
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
