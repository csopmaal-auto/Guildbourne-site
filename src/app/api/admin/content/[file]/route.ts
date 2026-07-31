/**
 * The generic content API — one dynamic route serves every collection,
 * dispatching on the registry. Every write path validates BEFORE committing,
 * so a malformed save can never reach the repo (or disk).
 *
 *   GET               → current draft data (+ blob sha)
 *   PUT  {data}       → object mode: replace the whole file
 *   PUT  {entry}      → list mode: merge one entry by slug
 *   POST {title}      → list mode: create entry (server owns the unique slug)
 *   DELETE ?slug=     → list mode: remove entry
 */
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cms/registry";
import { CmsError, getJsonFile, putJsonFile } from "@/lib/github";
import { slugify, uniqueSlug } from "@/utils/slugify";

type Params = { params: Promise<{ file: string }> };
type Entry = Record<string, unknown> & { slug?: string };

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

function mapError(err: unknown) {
  if (err instanceof CmsError) {
    if (err.status === 409) {
      return json(
        { error: "This file changed since you loaded it — reload and try again." },
        409,
      );
    }
    return json({ error: err.message }, err.status);
  }
  return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
}

export async function GET(_req: Request, { params }: Params) {
  const col = getCollection((await params).file);
  if (!col) return json({ error: "unknown_collection" }, 404);
  try {
    const { data, sha } = await getJsonFile(col.file);
    return json({ data, sha });
  } catch (err) {
    return mapError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  const col = getCollection((await params).file);
  if (!col) return json({ error: "unknown_collection" }, 404);

  const body = (await req.json().catch(() => null)) as {
    data?: unknown;
    entry?: Entry;
    sha?: string;
  } | null;
  if (!body) return json({ error: "invalid JSON body" }, 400);

  try {
    if (col.mode === "object") {
      const valid = col.validate(body.data);
      if (!valid.ok) return json({ errors: valid.errors }, 422);
      const sha = body.sha ?? (await getJsonFile(col.file)).sha;
      await putJsonFile(col.file, body.data, sha, `CMS: update ${col.label}`);
      return json({ ok: true });
    }

    // List mode — merge one entry by slug, then validate the whole array.
    const entry = body.entry;
    if (!entry?.slug || typeof entry.slug !== "string") {
      return json({ error: "entry.slug is required" }, 400);
    }
    const { data, sha } = await getJsonFile(col.file);
    const list = Array.isArray(data) ? (data as Entry[]) : [];
    const index = list.findIndex((e) => e.slug === entry.slug);
    if (index === -1) return json({ error: "entry_not_found" }, 404);

    const next = [...list];
    next[index] = entry;
    const valid = col.validate(next);
    if (!valid.ok) return json({ errors: valid.errors }, 422);

    await putJsonFile(
      col.file,
      next,
      sha,
      `CMS: update ${col.label} · ${entry.slug}`,
    );
    return json({ ok: true });
  } catch (err) {
    return mapError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  const col = getCollection((await params).file);
  if (!col) return json({ error: "unknown_collection" }, 404);
  if (col.mode !== "list" || !col.template) {
    return json({ error: "collection is not a list" }, 400);
  }

  const body = (await req.json().catch(() => null)) as { title?: string } | null;
  const title = body?.title?.trim();
  if (!title) return json({ error: "title is required" }, 400);

  try {
    const { data, sha } = await getJsonFile(col.file);
    const list = Array.isArray(data) ? (data as Entry[]) : [];
    const existing = new Set(list.map((e) => String(e.slug)));
    const slug = uniqueSlug(slugify(title) || "entry", existing);
    const entry = col.template(title, slug);

    const next = [...list, entry];
    const valid = col.validate(next);
    if (!valid.ok) return json({ errors: valid.errors }, 422);

    await putJsonFile(col.file, next, sha, `CMS: create ${col.label} · ${slug}`);
    return json({ ok: true, slug }, 201);
  } catch (err) {
    return mapError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const col = getCollection((await params).file);
  if (!col) return json({ error: "unknown_collection" }, 404);
  if (col.mode !== "list") return json({ error: "collection is not a list" }, 400);

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return json({ error: "slug is required" }, 400);

  try {
    const { data, sha } = await getJsonFile(col.file);
    const list = Array.isArray(data) ? (data as Entry[]) : [];
    if (!list.some((e) => e.slug === slug)) {
      return json({ error: "entry_not_found" }, 404);
    }
    const next = list.filter((e) => e.slug !== slug);
    const valid = col.validate(next);
    if (!valid.ok) return json({ errors: valid.errors }, 422);

    await putJsonFile(col.file, next, sha, `CMS: delete ${col.label} · ${slug}`);
    return json({ ok: true });
  } catch (err) {
    return mapError(err);
  }
}
