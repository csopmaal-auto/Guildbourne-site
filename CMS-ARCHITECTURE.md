# Git-Backed Headless CMS — Architecture & Build Blueprint

A complete, reusable blueprint for a **database-free CMS** where content lives as
**JSON files in your Git repo**, edited through a **password-gated `/admin` UI**
that commits changes via the **GitHub API**, with a **draft → publish workflow** so
routine edits never trigger a build.

It was distilled from a production Next.js marketing site but the pattern fits
**any content-driven project** — blog, portfolio, product catalog, docs site,
landing pages, directory, etc. Anywhere your content is mostly structured text +
images and you deploy from Git to a static host (Netlify / Vercel / Cloudflare).

> Stack assumed: **Next.js (App Router) + TypeScript + Tailwind**, hosted on a
> platform that **auto-deploys from a Git branch** (Netlify/Vercel). Swap pieces
> freely — the architecture is the point, not the framework.

---

## 0. The one-paragraph mental model

Your **content is JSON committed to Git**. The **public site imports that JSON at
build time** (so it's fully static and fast, and the CMS can be down without
affecting visitors). The **CMS is a thin editing layer**: it reads/writes those
same JSON files through the **GitHub Contents API**, validates every change before
committing, and writes to a **draft branch** that the host does *not* build.
A single **"Publish"** action merges draft → production, which is the *only* thing
that triggers a deploy. No database, no separate backend, no content drift.

---

## 1. Why this architecture (the design decisions)

| Decision | Why |
|---|---|
| **Content as JSON in the repo** | Version-controlled, diffable, revertable, zero hosting cost, no DB to run/secure/back-up. Content travels with the code. |
| **Public site imports JSON at build time** | Fully static output; the live site never depends on the CMS or GitHub being up. |
| **CMS commits via GitHub API** | No server/DB needed; the repo *is* the store. Works on serverless/edge hosts. |
| **A central "collection registry"** | One source of truth mapping each content file → its validator + editor + mode. Adding content = one registry line. |
| **Validate before every commit** | A malformed save can never reach the repo, so it can never break the next build. |
| **Draft → publish branch model** | Saves go to a non-built branch; only an explicit Publish deploys. Slashes build minutes and gives editorial control. |
| **Safe-by-default rendering** | Editors get Markdown (links/bold/lists), never raw HTML — closes the stored-XSS hole. |
| **Allow-list pickers** | Icons/illustrations/enums chosen from dropdowns of *valid* options, so editors can't pick something the site can't render. |

**Trade-offs to accept:** content writes are GitHub-API-latency (~hundreds of ms,
fine for an admin tool); not built for high-frequency or multi-user concurrent
editing (single editor / small team is the sweet spot); content size lives in Git
(great for KBs of text, not for thousands of large records).

---

## 2. System diagram

```
                          ┌─────────────────────────────────────────┐
   Visitor ──────────────▶│  PUBLIC SITE (static, prebuilt)          │
                          │  imports src/content/*.json at BUILD time │
                          └─────────────────────────────────────────┘
                                          ▲  build
                                          │ (only on push to PRODUCTION branch)
                                          │
   ┌──────────┐   gated    ┌───────────────────────────┐   GitHub API   ┌────────────┐
   │ Editor    │──/admin──▶│  CMS (Next.js app)         │───reads/writes▶│  Git repo   │
   │ (browser) │◀──────────│  • auth middleware          │   JSON on the  │  ├ main     │ ← PUBLISHED (built)
   └──────────┘            │  • editor UIs               │   DRAFT branch │  └ cms-draft│ ← DRAFTS (not built)
                           │  • content API routes        │◀──────────────│            │
                           │  • draft/publish API routes  │   merge on     └────────────┘
                           └───────────────────────────┘   Publish ─────────▲
                                                                              │
                                            "Publish" = merge draft → main = ONE build
```

Two planes:
- **Read plane (visitors):** repo `main` → build → static site. Never touches the CMS.
- **Write plane (editors):** `/admin` → API → GitHub `cms-draft` → (Publish) → `main`.

---

## 3. The building blocks

Each block below lists its **job**, the **shape/pattern**, and **how to build it**.

### 3.1 Content storage — `src/content/*.json`

Plain JSON, one file per "collection". Two shapes:

- **Object collection** — a single object edited as a whole. (e.g. `settings.json`,
  `copy.json`, `team.json`.)
- **List collection** — an array of slugged entries, edited per-entry. (e.g.
  `blog.json`, `products.json`, `case-studies.json`.)

```jsonc
// src/content/blog.json  (list collection)
[
  { "slug": "hello-world", "title": "Hello world", "date": "2025-01-01",
    "body": ["## Heading", "A **markdown** paragraph with a [link](/about)."] }
]

// src/content/settings.json (object collection)
{ "siteName": "Acme", "email": "hi@acme.com", "social": { "x": "https://x.com/acme" } }
```

> **Rule:** the public site and the CMS share these files. The site `import`s them;
> the CMS reads/writes them via API. One source of truth.

### 3.2 Typed content layer — `src/lib/content.ts`

Import each JSON, cast to a TypeScript type, re-export. The public site imports
**only** from here, so types + a single import surface stay consistent.

```ts
import blogRaw from "@/content/blog.json";
export type BlogPost = { slug: string; title: string; date: string; body: string[] };
export const blogPosts = blogRaw as unknown as BlogPost[];
```

### 3.3 The collection registry — `src/lib/cms/registry.ts`  ★ the heart

One array that the API and dashboard both read. **Adding new editable content =
add one entry here.**

```ts
export type Collection = {
  id: string;                 // URL-safe id used in API + edit routes
  label: string;              // shown in the dashboard
  file: string;               // repo-relative path, e.g. "src/content/blog.json"
  mode: "object" | "list";
  validate: (data: unknown) => { ok: true } | { ok: false; errors: string[] };
  editPath?: string;          // admin route for object editors (list uses a generic editor)
};

export const collections: Collection[] = [
  { id: "settings", label: "Site settings", file: "src/content/settings.json", mode: "object", validate: validateSettings, editPath: "/admin/settings" },
  { id: "blog",     label: "Blog posts",    file: "src/content/blog.json",     mode: "list",   validate: validateBlog },
  // …one line per content type
];

const byId = Object.fromEntries(collections.map((c) => [c.id, c]));
export const getCollection = (id: string) => byId[id];
```

### 3.4 Validation layer — `src/lib/cms/*Schema.ts` + a shared `limits.ts`

Every collection has a `validate(data)` returning `{ ok }` or `{ ok:false, errors }`.
Run it **server-side before committing**. Two layers:

- **Per-collection schema** — required fields, types, slug uniqueness, allowed enums.
- **Shared limits/formats** (`limits.ts`) — one map of `field → maxLength`, plus
  format checkers (email/url/phone/slug/ISO-date). The same map powers the editor's
  live character counters, so the UI and the server agree.

```ts
// limits.ts — single source of truth for length + format
export const TEXT_LIMITS: Record<string, number> = { title: 90, description: 320, body: 5000, slug: 60 };
export const limitFor = (k: string) => TEXT_LIMITS[k] ?? 400;

// blogSchema.ts
export function validateBlog(value: unknown) {
  const errors: string[] = [];
  if (!Array.isArray(value)) return { ok: false, errors: ["expected an array"] };
  const seen = new Set<string>();
  value.forEach((p: any, i) => {
    if (!p?.slug?.trim()) errors.push(`post[${i}].slug required`);
    else if (seen.has(p.slug)) errors.push(`duplicate slug "${p.slug}"`); else seen.add(p.slug);
    if ((p?.title?.length ?? 0) > limitFor("title")) errors.push(`post "${p.slug}".title too long`);
  });
  return errors.length ? { ok: false, errors } : { ok: true };
}
```

> **Tune limits so existing content always passes** — check current content against
> the limits before shipping, or a first save will reject valid live data.

### 3.5 GitHub client — `src/lib/github.ts`

A tiny `fetch` wrapper over the GitHub REST API (no SDK). Holds **all** Git logic.
Config from env: `GITHUB_TOKEN`, `GITHUB_REPO` ("owner/name"), `GITHUB_BRANCH`
(published, default `main`), `GITHUB_DRAFT_BRANCH` (default `cms-draft`).

Core functions:

| Function | API | Purpose |
|---|---|---|
| `getJsonFile(path)` | `GET /contents/{path}?ref=DRAFT` | Read + parse a file from the **draft** branch (+ returns its blob `sha`). |
| `getFileSha(path)` | `GET /contents` | Current blob sha (needed to update in place). |
| `putJsonFile(path, data, sha, msg)` | `PUT /contents` | Commit pretty-printed JSON to the **draft** branch. |
| `putRawFile(path, base64, msg)` | `PUT /contents` | Commit binary (image upload) to draft. |
| `ensureDraftBranch()` | `GET/POST /git/refs` | Create the draft branch from production if missing (idempotent). |
| `draftStatus()` | `GET /compare/main...draft` | `{ aheadBy, files[] }` — what's unpublished. |
| `publishDraft()` | `POST /merges` | Merge draft → production (= one build), then resync draft. |
| `discardDraft()` | `PATCH /git/refs` (force) | Reset draft back to production. |

Key implementation notes (these are the non-obvious bits):

- **CMS reads & writes target the DRAFT branch**, not production. The live build
  reads files from production at build time — untouched by these API calls.
- **Tag draft commits `[skip ci]`** (append to the commit message) so they're
  skipped even if branch-deploys are accidentally enabled. Backstop, not the
  primary guard.
- **Publish uses the merge API (`POST /merges`)**, which creates a *merge commit*
  on production. That commit's message has **no** `[skip ci]`, so it builds. ⚠ Do
  **not** fast-forward the production ref to the draft tip — the tip would be a
  `[skip ci]` commit and the host would skip the deploy.
- After publish, **reset the draft branch to the new production tip** so "pending"
  returns to 0.

```ts
export async function publishDraft() {
  const { aheadBy, files } = await draftStatus();
  if (aheadBy === 0) return { published: false, files: [] };
  await api(`/repos/${repo}/merges`, { method: "POST",
    body: JSON.stringify({ base: BRANCH, head: DRAFT, commit_message: `Publish ${files.length} change(s)` }) });
  const tip = await getBranchSha(BRANCH);
  await resetBranchTo(DRAFT, tip);           // resync → pending = 0
  return { published: true, files };
}
```

### 3.6 Authentication — `src/lib/adminAuth.ts` + `middleware`/`proxy.ts`

- **Login:** compare a typed password (constant-time) against `ADMIN_PASSWORD`; on
  success set a **signed, httpOnly session cookie** (HMAC via Web Crypto, with an
  expiry). Never store the password; never expose the GitHub token to the browser.
- **Gate:** middleware matches `["/admin/:path*", "/api/admin/:path*"]`, lets the
  login page/endpoint through, and for everything else verifies the cookie —
  redirect to login for pages, `401` for API.

```ts
// middleware (Next 16 calls this file proxy.ts)
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
export async function proxy(req) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();
  if (await verifySession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  return pathname.startsWith("/api/")
    ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
    : NextResponse.redirect(new URL("/admin/login", req.url));
}
```

> Because the gate covers `/api/admin/*`, individual API routes don't re-check auth —
> they trust the gate. (Defense-in-depth: you *can* also re-verify in sensitive routes.)

### 3.7 Content API — `src/app/api/admin/content/[file]/route.ts`

One dynamic route handles every collection, dispatching on the registry:

- **`GET`** → `getJsonFile(col.file)` → return data (+ sha) for the editor to load.
- **`PUT`** → object mode: validate + commit the whole file; list mode: read file,
  replace the entry matched by `slug`, validate the whole array, commit.
- **`POST`** (list only) → create a new entry from a title; **server owns the unique
  slug** (slugify + de-dupe), validate, commit.
- **`DELETE ?slug=`** (list only) → remove the entry, validate, commit.

Every branch: `validate()` first → commit only if ok → map a GitHub `409`
(stale-sha) to a friendly "reload and retry" message.

```ts
export async function PUT(req, { params }) {
  const col = getCollection((await params).file);
  if (!col) return json({ error: "unknown_collection" }, 404);
  const body = await req.json();
  if (col.mode === "object") {
    const v = col.validate(body.data); if (!v.ok) return json({ errors: v.errors }, 422);
    const sha = await getFileSha(col.file);
    await putJsonFile(col.file, body.data, sha, `CMS: update ${col.file}`);
    return json({ ok: true });
  }
  // list mode: merge one entry by slug, then validate the whole array … (see above)
}
```

### 3.8 Draft/publish API — three small routes

All behind the admin gate:
- **`GET /api/admin/status`** → `draftStatus()` mapped to `{ pending, items:[{file,label}] }`
  (map file paths → friendly labels via the registry). Drives the badge + dashboard bar.
- **`POST /api/admin/publish`** → `publishDraft()`; returns count or "nothing to publish";
  maps merge-conflict to a `409` with guidance.
- **`POST /api/admin/discard`** → `discardDraft()`.

### 3.9 Image uploads — `src/app/api/admin/upload/route.ts`

Accept a file, optimize server-side (e.g. `sharp`: resize/compress, with a lazy
import + raw fallback so a failure never blocks the save), base64-encode, and
`putRawFile()` it to the draft branch under `public/uploads/…`. Return the path,
which the editor stores in the content JSON. Validate type/size/dimensions
client-side before upload.

### 3.10 Editor UI

Two editor kinds, both built from **shared field primitives** (`fields.tsx`):
`Field` (label + live counter + format hint), `StringList` (add/remove/reorder of
text items), image picker, allow-list dropdowns, Save button, status banners.

- **Object editor** — a `useObjectEditor(id)` hook (load → hold local state →
  validate-and-commit on save) + a declarative set of `<Field>`s. Reused by every
  object collection (settings, copy, team…).
- **List editor** — a generic `/admin/edit/[file]/[slug]` page that loads one entry,
  edits its fields, and saves (merge-by-slug). Plus a "+ New" button (POST) and a
  per-entry delete.

> Keep editors **declarative and registry-driven** so a new content type needs
> little/no new UI — ideally just a registry line + (for object types) a small field list.

### 3.11 Rich text (optional but recommended)

Editors author **Markdown**, rendered with `markdown-to-jsx` (or MDX/remark).
Provide a small **toolbar** (Bold / Italic / Link, with an internal-page picker +
external URL) that inserts Markdown at the cursor — friendly for non-technical
editors while keeping the safe Markdown pipeline.

**Security:** disable raw-HTML parsing. If you need a tag Markdown lacks (e.g.
underline `<u>`), allow it via a **strict whitelist**: escape *every* angle bracket
except that one bare tag, so nothing else can be injected. Internal links → client
router; external → `target="_blank" rel="noopener noreferrer"`; sanitize
`javascript:`/`data:` hrefs.

### 3.12 SEO integration (for marketing/content sites)

Keep a per-route SEO map (title/description/canonical/OG/noindex/custom JSON-LD)
in its own object collection + a `buildMetadata()` helper wired into every page's
`generateMetadata`. Ships empty (`{}`) so pages are unchanged until an editor opts
in. Serialize all JSON-LD through one helper that escapes `<`/`>` (prevents a CMS
title containing `</script>` from breaking out).

### 3.13 Dashboard — draft-aware

Lists every collection + a **"Publish N changes"** bar (shown when pending > 0) with
**Publish** and **Discard**, a **pending-count badge** in the top bar, and a
**logout guard** (if unpublished changes exist, prompt: Publish / Keep draft /
Discard / Cancel). The per-entry lists should **load from the draft branch** at
request time (falling back to the imported published JSON) so newly-created/edited
entries show before publishing. A small **status context** (refetches on
navigation/focus/after-save) keeps the badge + bar in sync.

---

## 4. Data-flow walkthroughs

**Load an editor:** browser → `GET /api/admin/content/blog` → gate ✓ →
`getJsonFile` (draft branch, auto-creates it) → JSON → editor renders fields.

**Save (draft):** editor → `PUT /api/admin/content/blog {page}` → gate ✓ → read
file → replace entry by slug → `validate()` → `putJsonFile` to **draft** (`[skip ci]`)
→ **no build**. Badge updates via the status context.

**Publish:** dashboard → `POST /api/admin/publish` → `draftStatus()` (ahead?) →
`POST /merges` draft→main (merge commit, **builds**) → reset draft to main →
pending = 0 → site live in ~1–2 min.

**Discard:** dashboard → `POST /api/admin/discard` → force-reset draft to main →
drafts gone.

**Create:** "+ New" → `POST /api/admin/content/blog {title}` → server slugifies +
de-dupes → builds a default entry from a template → validate → commit to draft →
redirect to the new entry's editor.

---

## 5. The draft/publish branch model (the credit-saver)

```
main      ●────────────────────────────●  (built by host on every push)
           \                          ↗  merge = Publish (the ONLY build)
cms-draft   ●──●──●──●  (save, save, save … each [skip ci], NOT built)
```

- **Host config is the linchpin:** set the host to **build only the production
  branch** (Netlify: "Deploy only the production branch"; Vercel: ignored-build-step
  or production-only). Then commits to `cms-draft` never build.
- `[skip ci]` on draft commits is the backstop if branch-deploys are on.
- **Publish = merge commit on main** (never a fast-forward to a skip-ci tip).
- **Discard = reset draft to main.** **Pending = `compare main...draft`.**

Result: an editor can make 20 edits across 10 pages over a day with **zero
builds**, then publish once = **one build**.

---

## 6. Security model

- **Auth:** signed httpOnly session cookie (HMAC, expiry); constant-time password
  compare; gate via middleware on all `/admin` + `/api/admin`.
- **Secrets server-only:** `GITHUB_TOKEN` lives in server env, never shipped to the
  browser. Use a **fine-grained PAT** scoped to the one repo, **Contents:
  read/write** only.
- **Output safety:** no raw HTML from editors (Markdown only, whitelist exceptions);
  escape all JSON-LD; sanitize link hrefs.
- **Integrity:** validate every write server-side; the host build is a final gate
  (a bad commit that somehow lands just fails the draft branch, never production
  until merged).
- **`/admin` is `noindex`.**

---

## 7. Environment variables

```bash
# CMS auth
ADMIN_PASSWORD=                 # the editor's login password
ADMIN_SESSION_SECRET=           # long random string; signs the session cookie

# Publishing target
GITHUB_TOKEN=                   # fine-grained PAT, Contents: read/write, one repo
GITHUB_REPO=owner/name
GITHUB_BRANCH=main              # PUBLISHED branch the host builds
GITHUB_DRAFT_BRANCH=cms-draft   # draft branch (auto-created); host must NOT build it
```

Without these, design the public site to **build and run normally** and the CMS to
show a graceful "not configured" notice (so the marketing site is never coupled to
CMS config).

---

## 8. File/folder structure (template)

```
src/
  content/                      # the data — JSON per collection
    settings.json  copy.json  blog.json  products.json  …
  lib/
    content.ts                  # imports + types + re-exports (public import surface)
    adminAuth.ts                # session sign/verify, password check
    github.ts                   # GitHub client + draft/publish branch ops
    cms/
      registry.ts               # ★ collections registry
      limits.ts                 # length + format single-source
      blogSchema.ts  …          # per-collection validators
  middleware.ts (proxy.ts)      # the auth gate
  app/
    (public pages — import from lib/content.ts)
    admin/
      layout.tsx                # AdminShell: sidebar, top bar, status provider
      page.tsx                  # dashboard: lists + Publish bar (draft-aware)
      login/page.tsx
      settings/page.tsx  …      # object editors
      edit/[file]/[slug]/page.tsx  # generic list-entry editor
    api/admin/
      login/route.ts  logout/route.ts
      content/[file]/route.ts   # GET/PUT/POST/DELETE
      upload/route.ts
      status/route.ts  publish/route.ts  discard/route.ts
  components/admin/
    AdminShell  AdminTopBar  AdminStatusProvider  PublishBar
    fields.tsx (Field, StringList, SaveButton, StatusBanner, …)
    objectEditor.tsx  PageEditor/ListEditor  RichTextField  ImageField
```

---

## 9. Step-by-step: building it for a NEW project

1. **Model your content.** List your content types; mark each **object** (one-of:
   settings, homepage copy) or **list** (many-of: posts, products, projects). Write
   the JSON files in `src/content/` with real seed data.
2. **Type + re-export** each in `lib/content.ts`; make the public pages import from
   there and render. (Now you have a static site with file-based content — no CMS yet.)
3. **Add the GitHub client** (`github.ts`) with the draft-branch ops, and the env vars.
4. **Add auth** (`adminAuth.ts` + middleware gate) and a login page.
5. **Add the registry** — one entry per content type, each pointing at its file +
   validator + mode.
6. **Write validators** (per-collection) + the shared `limits.ts`.
7. **Add the content API** (`content/[file]/route.ts`) — generic GET/PUT/POST/DELETE
   driven by the registry.
8. **Build the editors** — the `useObjectEditor` hook + field primitives for object
   types; the generic `edit/[file]/[slug]` page + "New"/"Delete" for list types.
9. **Add the draft/publish layer** — `status`/`publish`/`discard` routes, the
   `PublishBar`, the badge, the logout guard, the status context. **Set the host to
   build only the production branch.**
10. **Optional:** rich-text toolbar, image uploads, per-page SEO editor, draft-aware
    dashboard lists.
11. **Verify:** save → confirm no build; publish → confirm one build → live.

**Minimum viable CMS** = steps 1–8 (edits commit straight to main and build each
time). **Add steps 9–10** when build cost / editorial control matter.

---

## 10. Gotchas & decisions log (learned the hard way)

- **Build only the production branch**, or draft commits will build anyway. Set it
  in the **host UI** (don't PATCH it via API — you can clobber repo-linkage fields).
- **Publish must create a merge commit**, not fast-forward to a `[skip ci]` tip
  (that would skip the deploy).
- **Tune content limits to current data** before shipping, or the first save rejects
  valid live content.
- **Stale-sha (409) on save** → the file changed since load; surface a "reload"
  message, don't show a raw 502.
- **The dashboard's static lists lag drafts** unless you load them from the draft
  branch at request time (creates won't show otherwise).
- **Uploaded-image previews** show the *published* image until publish (the draft
  blob isn't on the live domain yet) — acceptable, or serve previews via the GitHub
  raw URL.
- **Disable raw HTML in Markdown** (stored-XSS). Whitelist any extra tag by escaping
  everything except that exact tag.
- **Keep the public site decoupled** from CMS config so it always builds.
- **One editor at a time** is the design center; concurrent edits rely on sha
  conflict detection, not locking.

---

## 11. Tech stack / dependencies

- **Framework:** Next.js (App Router) + TypeScript. (Portable to Remix/SvelteKit/Astro.)
- **Styling:** Tailwind (editors + site).
- **Git:** GitHub REST API via `fetch` (no SDK). Equivalent works on GitLab/Gitea.
- **Markdown:** `markdown-to-jsx` (or MDX/remark).
- **Images:** `sharp` (server-side optimize).
- **Auth:** Web Crypto (HMAC) — no auth library required.
- **Host:** Netlify/Vercel/Cloudflare — anything that auto-builds from a Git branch
  and lets you restrict which branch builds.

---

### Appendix — adapting the content model to different project types

| Project | Object collections | List collections |
|---|---|---|
| **Marketing site** | settings, section copy, nav, SEO, team | services, industries, case studies, blog, legal |
| **Blog / publication** | settings, about, SEO | posts, authors, categories |
| **Portfolio** | settings, about, contact | projects, testimonials |
| **Product catalog** | settings, store config | products, collections, FAQs |
| **Docs site** | settings, sidebar config | doc pages (often nested by folder) |
| **Directory / listings** | settings, taxonomy | listings, locations, categories |

The engine is identical — only the JSON shapes + validators change. That's the
whole point: **model content as JSON collections, register them, validate them,
edit them through one generic API, and gate deploys behind an explicit Publish.**
```
