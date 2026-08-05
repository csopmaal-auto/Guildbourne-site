# Guildbourne Centre — Website & CMS

A complete redesign of [guildbournecentre.co.uk](https://www.guildbournecentre.co.uk/) — a premium,
fully static Next.js 15 site with a **Git-backed headless CMS** built to the architecture in
[CMS-ARCHITECTURE.md](./CMS-ARCHITECTURE.md): content lives as JSON in this repo, editors work in a
password-gated `/admin` UI, saves commit to a draft branch via the GitHub API, and a single
**Publish** action merges draft → production (the only thing that triggers a build).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · GSAP
(ScrollTrigger) · Lenis smooth scroll · React Hook Form + Zod · Lucide · markdown-to-jsx · sharp

## Quick start

```bash
npm install
npm run dev
```

> If your machine blocks native binaries (e.g. a Windows Application Control policy stops
> `@next/swc`), use `npm run dev:webpack` — turbopack needs the native compiler, webpack falls
> back to WASM.

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin — the dev password is in `.env.local` (default `guildbourne-dev`)

With no GitHub env vars set, the CMS runs in **local mode**: saves write straight to
`src/content/*.json` on disk, so the whole admin is usable offline (there is no draft/publish cycle
locally — that appears once GitHub is configured).

## Content architecture

All content is JSON in `src/content/`, typed and re-exported through `src/lib/content.ts` (the only
import surface the public site uses). One registry drives the whole CMS —
`src/lib/cms/registry.ts`; adding a content type is one registry entry + a Zod validator in
`schemas.ts` + a field layout in `editorConfig.ts`.

| Collection | Mode | Powers |
|---|---|---|
| `settings` | object | Name, contact, opening hours (+ open-now logic), socials, announcement bar |
| `navigation` | object | Header menu, footer columns, legal links |
| `homepage` | object | Hero, welcome, featured stores, every homepage section |
| `pages` | object | Page headers for stores / offers / events / news |
| `contact` | object | Form config, directions, map, floorplan, FAQs, lettings |
| `seo` | object | Title template, defaults, per-route overrides |
| `stores` | list | The directory — 20 stores migrated from the old site |
| `offers` | list | Promotional cards (optional countdown via `validUntil`) |
| `events` | list | What's on — upcoming/past split is automatic |
| `news` | list | Editorial stories |
| `facilities` | list | Icon cards (icons from an allow-list) |
| `legal` | list | Privacy / cookies / accessibility pages |

Every write is validated server-side (`src/lib/cms/schemas.ts`) before it can be committed — a
malformed save can never reach the repo. Run the same checks yourself:

```bash
npm run validate:content
```

## The publish workflow (production)

1. Editor saves → JSON committed to the **draft branch** (`cms-draft`) with `[skip ci]` — no build.
2. Dashboard shows "N changes ready to publish".
3. **Publish** → merge commit onto the production branch → exactly one build → live in ~1–2 min.
4. **Discard** resets the draft branch to production.

> ⚠️ **Host configuration is the linchpin:** set your host (Netlify/Vercel) to **build only the
> production branch**, or draft saves will trigger builds anyway.

## Environment variables

See [.env.example](./.env.example). In production you need:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` | `/admin` login + signed session cookie |
| `GITHUB_TOKEN` | Fine-grained PAT, **Contents: read/write**, this repo only |
| `GITHUB_REPO` | `owner/name` |
| `GITHUB_BRANCH` / `GITHUB_DRAFT_BRANCH` | Default `main` / `cms-draft` |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata/sitemap/JSON-LD |
| `CONTACT_WEBHOOK_URL` *(optional)* | Receives contact-form submissions as JSON |
| `NEWSLETTER_ENDPOINT` *(optional)* | Newsletter provider endpoint (also settable in Site settings) |

In development, contact + newsletter submissions fall back to git-ignored files under `.data/` so
both flows are testable end-to-end.

## Project layout

```
src/
  content/            ← the data (12 JSON collections)
  lib/
    content.ts        ← typed import surface for the public site
    cms/              ← registry ★, schemas (Zod), limits, options, editorConfig
    github.ts         ← GitHub Contents API client + draft/publish ops (+ local dev driver)
    adminAuth.ts      ← HMAC session auth (Web Crypto, no auth library)
    seo.ts, hours.ts, gsap.ts
  middleware.ts       ← auth gate for /admin + /api/admin
  app/
    (site)/           ← public pages (home, stores, offers, events, news, contact, legal)
    admin/            ← login + dashboard + editors (registry-driven, declarative)
    api/admin/        ← login/logout, content/[file], upload, status, publish, discard
    api/contact, api/newsletter, sitemap.ts, robots.ts
  components/
    layout/ sections/ admin/ motion/ ui/
  hooks/ types/ utils/
scripts/validate-content.ts
```

## Content provenance

- **Real, migrated from the old site:** all 20 stores (descriptions, phones, links, logos), centre
  hours, contact details, socials, the floorplan SVG and the exterior photo.
- **Sample seeds to replace via the admin:** events, the two non-launch news stories, offers and
  facilities are honest but illustrative starters (sample events say so in their body copy).
- **Legal pages** describe how this site actually behaves (no tracking cookies, one admin session
  cookie) — have them reviewed before launch as a formality.

## Accessibility & performance

Fully static output (52 pages), semantic headings, keyboard-navigable menus/search/filters, focus
states throughout, `prefers-reduced-motion` respected by Lenis/GSAP/Framer alike, image
optimization via `next/image` + sharp, and JSON-LD (ShoppingCenter, Store, Event, NewsArticle,
BreadcrumbList) with escaped serialization.
