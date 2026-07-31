import { notFound } from "next/navigation";
import { EntryEditorView } from "@/components/admin/EntryEditorView";
import { entryEditors } from "@/lib/cms/editorConfig";
import { getCollection } from "@/lib/cms/registry";

export default async function EntryEditPage({
  params,
}: {
  params: Promise<{ file: string; slug: string }>;
}) {
  const { file, slug } = await params;
  const collection = getCollection(file);
  if (!collection || collection.mode !== "list" || !entryEditors[file]) {
    notFound();
  }

  return (
    <EntryEditorView collectionId={file} slug={decodeURIComponent(slug)} />
  );
}
