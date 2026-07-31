"use client";

/**
 * Shared field primitives for the declarative admin editors.
 * Every input reports changes upward immediately; validation happens
 * server-side on save (the same schemas that gate the API).
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Italic,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { limitFor } from "@/lib/cms/limits";
import { cn } from "@/lib/utils";

/* ————— Wrapper ————— */

export function FieldShell({
  label,
  hint,
  required,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  counter?: { length: number; max: number };
  children: ReactNode;
}) {
  const over = counter && counter.length > counter.max;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-[13px] font-semibold text-foreground">
          {label}
          {required ? <span className="ml-0.5 text-bronze">*</span> : null}
        </Label>
        {counter ? (
          <span
            className={cn(
              "text-[11px] tabular-nums",
              over ? "font-semibold text-destructive" : "text-muted-foreground",
            )}
          >
            {counter.length}/{counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* ————— Text / textarea ————— */

export function TextField({
  label,
  value,
  onChange,
  limitKey,
  hint,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  limitKey?: string;
  hint?: string;
  required?: boolean;
  type?: string;
}) {
  const max = limitKey ? limitFor(limitKey) : undefined;
  return (
    <FieldShell
      label={label}
      hint={hint}
      required={required}
      counter={max ? { length: value?.length ?? 0, max } : undefined}
    >
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  limitKey,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  limitKey?: string;
  hint?: string;
  rows?: number;
}) {
  const max = limitKey ? limitFor(limitKey) : undefined;
  return (
    <FieldShell
      label={label}
      hint={hint}
      counter={max ? { length: value?.length ?? 0, max } : undefined}
    >
      <Textarea
        value={value ?? ""}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

/* ————— Toggle / select / date ————— */

export function ToggleField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border bg-card px-3 py-2.5">
      <div>
        <Label className="text-[13px] font-semibold">{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-gold",
          value ? "bg-bronze" : "bg-stone-dark",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform",
            value && "translate-x-4",
          )}
        />
      </button>
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  allowEmpty,
  emptyLabel = "— none —",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[] | readonly string[];
  hint?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const normalized = useMemo(
    () =>
      options.map((o) =>
        typeof o === "string" ? { value: o, label: o } : o,
      ),
    [options],
  );
  const EMPTY = "__empty__";
  return (
    <FieldShell label={label} hint={hint}>
      <Select
        value={value || (allowEmpty ? EMPTY : value)}
        onValueChange={(v) => onChange(v === EMPTY ? "" : v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value={EMPTY}>{emptyLabel}</SelectItem> : null}
          {normalized.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function DateField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <Input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-fit"
      />
    </FieldShell>
  );
}

/* ————— Markdown (paragraph list) ————— */

/**
 * Edits a `string[]` of markdown paragraphs as one document — paragraphs are
 * split on blank lines when the value is pushed up. Local state means typing
 * a blank line never fights the controlled round-trip.
 */
export function MarkdownField({
  label,
  value,
  onChange,
  hint,
  rows = 8,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
}) {
  const [text, setText] = useState(() => (value ?? []).join("\n\n"));
  const ref = useRef<HTMLTextAreaElement>(null);

  // Re-sync only when the external value semantically differs (e.g. reload).
  useEffect(() => {
    const externalJson = JSON.stringify(value ?? []);
    const localJson = JSON.stringify(splitParagraphs(text));
    if (externalJson !== localJson) setText((value ?? []).join("\n\n"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const push = (next: string) => {
    setText(next);
    onChange(splitParagraphs(next));
  };

  const wrapSelection = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = text.slice(s, e) || "text";
    const next = text.slice(0, s) + before + selected + after + text.slice(e);
    push(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  const insertLink = () => {
    const el = ref.current;
    if (!el) return;
    const url = window.prompt("Link URL (e.g. /stores or https://…)");
    if (!url) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = text.slice(s, e) || "link text";
    push(`${text.slice(0, s)}[${selected}](${url})${text.slice(e)}`);
  };

  return (
    <FieldShell label={label} hint={hint ?? "Markdown — separate paragraphs with a blank line. Use ## for subheadings."}>
      <div className="overflow-hidden rounded-md border bg-card focus-within:ring-2 focus-within:ring-gold/60">
        <div className="flex items-center gap-1 border-b bg-muted/60 px-2 py-1">
          <ToolbarButton label="Bold" onClick={() => wrapSelection("**")}>
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Italic" onClick={() => wrapSelection("*")}>
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Insert link" onClick={insertLink}>
            <Link2 className="size-3.5" />
          </ToolbarButton>
        </div>
        <Textarea
          ref={ref}
          value={text}
          rows={rows}
          onChange={(e) => push(e.target.value)}
          className="rounded-none border-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </FieldShell>
  );
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-stone hover:text-foreground focus-gold"
    >
      {children}
    </button>
  );
}

/* ————— Image ————— */

export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onChange(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <FieldShell label={label} hint={hint ?? "Upload an image or paste a site-relative path."}>
      <div className="flex items-start gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-stone">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={value ?? ""}
            placeholder="/uploads/…"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
              >
                Remove
              </Button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </FieldShell>
  );
}

/* ————— String list ————— */

export function StringListField({
  label,
  value,
  onChange,
  hint,
  limitKey,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  limitKey?: string;
}) {
  const list = value ?? [];
  const update = (i: number, v: string) =>
    onChange(list.map((item, idx) => (idx === i ? v : item)));
  return (
    <FieldShell label={label} hint={hint}>
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              maxLength={limitKey ? limitFor(limitKey) : undefined}
              onChange={(e) => update(i, e.target.value)}
            />
            <RowControls
              onUp={i > 0 ? () => onChange(move(list, i, i - 1)) : undefined}
              onDown={i < list.length - 1 ? () => onChange(move(list, i, i + 1)) : undefined}
              onRemove={() => onChange(list.filter((_, idx) => idx !== i))}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, ""])}>
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </FieldShell>
  );
}

/* ————— Hours ————— */

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type DayHoursValue = { open: string; close: string; closed: boolean };

export function HoursField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, DayHoursValue>;
  onChange: (v: Record<string, DayHoursValue>) => void;
}) {
  const set = (day: string, patch: Partial<DayHoursValue>) =>
    onChange({ ...value, [day]: { ...value[day], ...patch } });
  return (
    <FieldShell label={label}>
      <div className="overflow-hidden rounded-md border">
        {DAYS.map((day) => {
          const d = value?.[day] ?? { open: "09:00", close: "17:00", closed: false };
          return (
            <div
              key={day}
              className="flex items-center gap-3 border-b bg-card px-3 py-2 text-sm last:border-b-0"
            >
              <span className="w-24 font-medium capitalize">{day}</span>
              <Input
                type="time"
                value={d.open}
                disabled={d.closed}
                onChange={(e) => set(day, { open: e.target.value })}
                className="w-fit"
                aria-label={`${day} opening time`}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="time"
                value={d.close}
                disabled={d.closed}
                onChange={(e) => set(day, { close: e.target.value })}
                className="w-fit"
                aria-label={`${day} closing time`}
              />
              <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={d.closed}
                  onChange={(e) => set(day, { closed: e.target.checked })}
                  className="accent-bronze"
                />
                Closed
              </label>
            </div>
          );
        })}
      </div>
    </FieldShell>
  );
}

/* ————— Shared row controls ————— */

export function RowControls({
  onUp,
  onDown,
  onRemove,
}: {
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconButton label="Move up" onClick={onUp}>
        <ArrowUp className="size-3.5" />
      </IconButton>
      <IconButton label="Move down" onClick={onDown}>
        <ArrowDown className="size-3.5" />
      </IconButton>
      <IconButton label="Remove" onClick={onRemove} destructive>
        <Trash2 className="size-3.5" />
      </IconButton>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick?: () => void;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "rounded p-1.5 transition-colors focus-gold disabled:opacity-25",
        destructive
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-stone hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/* ————— Collapsible item shell for object lists ————— */

export function CollapsibleItem({
  title,
  controls,
  defaultOpen = false,
  children,
}: {
  title: string;
  controls: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border bg-card">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-1.5 rounded px-1 py-1 text-left text-sm font-medium focus-gold"
          aria-expanded={open}
        >
          {open ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
          <span className="truncate">{title}</span>
        </button>
        {controls}
      </div>
      {open ? <div className="space-y-4 border-t px-3 py-3">{children}</div> : null}
    </div>
  );
}

/* ————— Ref options (stores etc.) ————— */

const optionsCache = new Map<string, { value: string; label: string }[]>();

export function useCollectionOptions(collectionId: string) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    () => optionsCache.get(collectionId) ?? [],
  );

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/content/${collectionId}`);
    if (!res.ok) return;
    const { data } = await res.json();
    if (!Array.isArray(data)) return;
    const opts = data.map((e: Record<string, unknown>) => ({
      value: String(e.slug ?? ""),
      label: String(e.name ?? e.title ?? e.slug ?? ""),
    }));
    optionsCache.set(collectionId, opts);
    setOptions(opts);
  }, [collectionId]);

  useEffect(() => {
    if (!optionsCache.has(collectionId)) void load();
  }, [collectionId, load]);

  return options;
}
