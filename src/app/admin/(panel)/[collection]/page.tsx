import { notFound } from "next/navigation";
import { ListIndexView } from "@/components/admin/ListIndexView";
import { ObjectEditorView } from "@/components/admin/ObjectEditorView";
import { objectEditors } from "@/lib/cms/editorConfig";
import { getCollection } from "@/lib/cms/registry";

/**
 * One route serves every collection: object collections get their sectioned
 * editor, list collections get the entry index. Only the id crosses to the
 * client — registry entries hold functions, which don't serialize.
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: id } = await params;
  const collection = getCollection(id);
  if (!collection) notFound();

  if (collection.mode === "object") {
    if (!objectEditors[collection.id]) notFound();
    return <ObjectEditorView collectionId={collection.id} />;
  }
  return <ListIndexView collectionId={collection.id} />;
}
