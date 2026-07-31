"use client";

/** Generic editor for object collections — sections + fields from editorConfig. */
import { FieldRenderer } from "@/components/admin/FieldRenderer";
import {
  EditorError,
  EditorHeader,
  EditorLoading,
  SaveBar,
} from "@/components/admin/EditorChrome";
import { useObjectEditor } from "@/hooks/useEditor";
import { objectEditors } from "@/lib/cms/editorConfig";
import { getCollection } from "@/lib/cms/registry";

/**
 * Server pages pass only the collection id (registry entries hold functions,
 * which can't cross the server → client boundary); the lookup happens here.
 */
export function ObjectEditorView({ collectionId }: { collectionId: string }) {
  const collection = getCollection(collectionId)!;
  const sections = objectEditors[collectionId] ?? [];
  const editor = useObjectEditor(collection.id);

  if (editor.loading) return <EditorLoading />;
  if (editor.loadError || !editor.data)
    return <EditorError message={editor.loadError ?? "Could not load content."} />;

  return (
    <div>
      <EditorHeader title={collection.label} description={collection.description} />
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border bg-card p-5">
            <h2 className="font-bold">{section.title}</h2>
            {section.description ? (
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {section.description}
              </p>
            ) : null}
            <div className="mt-4 space-y-4">
              {section.fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  data={editor.data!}
                  onChange={editor.setData}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <SaveBar
        saveState={editor.saveState}
        dirty={editor.dirty}
        onSave={() => void editor.save()}
        onReload={() => void editor.reload()}
      />
    </div>
  );
}
