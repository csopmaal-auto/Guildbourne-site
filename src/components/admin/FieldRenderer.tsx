"use client";

/**
 * Renders a FieldDef against a data object — the engine behind every admin
 * form. Values are read/written by dot path, so object editors, list-entry
 * editors and nested object-lists all share one code path.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FieldDef } from "@/lib/cms/editorConfig";
import { getPath, setPath } from "@/utils/objectPath";
import { Plus } from "lucide-react";
import {
  CollapsibleItem,
  DateField,
  FieldShell,
  HoursField,
  ImageField,
  MarkdownField,
  RowControls,
  SelectField,
  StringListField,
  TextField,
  TextareaField,
  ToggleField,
  move,
  useCollectionOptions,
} from "./fields";

type Data = Record<string, unknown>;

export function FieldRenderer({
  field,
  data,
  onChange,
}: {
  field: FieldDef;
  data: Data;
  onChange: (next: Data) => void;
}) {
  const value = getPath(data, field.name);
  const set = (v: unknown) => onChange(setPath(data, field.name, v));

  switch (field.kind) {
    case "text":
      return (
        <TextField
          label={field.label}
          value={(value as string) ?? ""}
          onChange={set}
          limitKey={field.limitKey}
          hint={field.hint}
          required={field.required}
        />
      );
    case "textarea":
      return (
        <TextareaField
          label={field.label}
          value={(value as string) ?? ""}
          onChange={set}
          limitKey={field.limitKey}
          hint={field.hint}
          rows={field.rows}
        />
      );
    case "markdown":
      return (
        <MarkdownField
          label={field.label}
          value={(value as string[]) ?? []}
          onChange={set}
          hint={field.hint}
          rows={field.rows}
        />
      );
    case "string-list":
      return (
        <StringListField
          label={field.label}
          value={(value as string[]) ?? []}
          onChange={set}
          hint={field.hint}
          limitKey={field.limitKey}
        />
      );
    case "image":
      return (
        <ImageField
          label={field.label}
          value={(value as string) ?? ""}
          onChange={set}
          hint={field.hint}
        />
      );
    case "toggle":
      return (
        <ToggleField
          label={field.label}
          value={Boolean(value)}
          onChange={set}
          hint={field.hint}
        />
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          value={(value as string) ?? ""}
          onChange={set}
          options={field.options}
          hint={field.hint}
        />
      );
    case "date":
      return (
        <DateField
          label={field.label}
          value={(value as string) ?? ""}
          onChange={set}
          hint={field.hint}
        />
      );
    case "hours":
      return (
        <HoursField
          label={field.label}
          value={(value as Record<string, { open: string; close: string; closed: boolean }>) ?? {}}
          onChange={set}
        />
      );
    case "ref-select":
      return (
        <RefSelectField field={field} value={(value as string) ?? ""} onChange={set} />
      );
    case "ref-multi":
      return (
        <RefMultiField field={field} value={(value as string[]) ?? []} onChange={set} />
      );
    case "object-list":
      return (
        <ObjectListField field={field} value={(value as Data[]) ?? []} onChange={set} />
      );
    case "record-list":
      return (
        <RecordListField
          field={field}
          value={(value as Record<string, Data>) ?? {}}
          onChange={set}
        />
      );
  }
}

/* ————— Composite kinds ————— */

function RefSelectField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { kind: "ref-select" }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = useCollectionOptions(field.collection);
  return (
    <SelectField
      label={field.label}
      value={value}
      onChange={onChange}
      options={options}
      hint={field.hint}
      allowEmpty={field.allowEmpty}
    />
  );
}

function RefMultiField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { kind: "ref-multi" }>;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const options = useCollectionOptions(field.collection);
  const available = options.filter((o) => !value.includes(o.value));
  const labelFor = (slug: string) =>
    options.find((o) => o.value === slug)?.label ?? slug;

  return (
    <FieldShell label={field.label} hint={field.hint}>
      <div className="space-y-2">
        {value.map((slug, i) => (
          <div
            key={slug}
            className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm"
          >
            <span className="flex-1 truncate">{labelFor(slug)}</span>
            <RowControls
              onUp={i > 0 ? () => onChange(move(value, i, i - 1)) : undefined}
              onDown={i < value.length - 1 ? () => onChange(move(value, i, i + 1)) : undefined}
              onRemove={() => onChange(value.filter((s) => s !== slug))}
            />
          </div>
        ))}
        {available.length ? (
          <SelectField
            label=""
            value=""
            allowEmpty
            emptyLabel="Add a store…"
            options={available}
            onChange={(v) => v && onChange([...value, v])}
          />
        ) : null}
      </div>
    </FieldShell>
  );
}

function ObjectListField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { kind: "object-list" }>;
  value: Data[];
  onChange: (v: Data[]) => void;
}) {
  const blankItem = (): Data => {
    const item: Data = {};
    for (const f of field.fields) {
      if (f.kind === "toggle") item[f.name] = false;
      else if (f.kind === "object-list" || f.kind === "string-list") item[f.name] = [];
      else if (f.kind === "select") item[f.name] = f.options[0] ?? "";
      else item[f.name] = "";
    }
    return item;
  };

  return (
    <FieldShell label={field.label} hint={field.hint}>
      <div className="space-y-2">
        {value.map((item, i) => (
          <CollapsibleItem
            key={i}
            title={
              String(field.itemLabelField ? (item[field.itemLabelField] ?? "") : "") ||
              `Item ${i + 1}`
            }
            controls={
              <RowControls
                onUp={i > 0 ? () => onChange(move(value, i, i - 1)) : undefined}
                onDown={i < value.length - 1 ? () => onChange(move(value, i, i + 1)) : undefined}
                onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
              />
            }
          >
            {field.fields.map((f) => (
              <FieldRenderer
                key={f.name}
                field={f}
                data={item}
                onChange={(next) =>
                  onChange(value.map((it, idx) => (idx === i ? next : it)))
                }
              />
            ))}
          </CollapsibleItem>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...value, blankItem()])}
        >
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </FieldShell>
  );
}

function RecordListField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { kind: "record-list" }>;
  value: Record<string, Data>;
  onChange: (v: Record<string, Data>) => void;
}) {
  const keys = Object.keys(value);

  const renameKey = (from: string, to: string) => {
    const next: Record<string, Data> = {};
    for (const k of keys) next[k === from ? to : k] = value[k];
    onChange(next);
  };

  return (
    <FieldShell label={field.label} hint={field.hint}>
      <div className="space-y-2">
        {keys.map((key) => (
          <CollapsibleItem
            key={key}
            title={key}
            controls={
              <RowControls
                onRemove={() => {
                  const next = { ...value };
                  delete next[key];
                  onChange(next);
                }}
              />
            }
          >
            <FieldShell label={field.keyLabel}>
              <Input
                defaultValue={key}
                onBlur={(e) => {
                  const to = e.target.value.trim();
                  if (to && to !== key) renameKey(key, to);
                }}
              />
            </FieldShell>
            {field.fields.map((f) => (
              <FieldRenderer
                key={f.name}
                field={f}
                data={value[key]}
                onChange={(next) => onChange({ ...value, [key]: next })}
              />
            ))}
          </CollapsibleItem>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            let key = "/new-page";
            let i = 2;
            while (key in value) key = `/new-page-${i++}`;
            const blank: Data = {};
            for (const f of field.fields) blank[f.name] = "";
            onChange({ ...value, [key]: blank });
          }}
        >
          <Plus className="size-3.5" /> Add page
        </Button>
      </div>
    </FieldShell>
  );
}
