/**
 * Single source of truth for content length limits + format checks.
 * The same map powers server-side validation and the editor's live counters,
 * so the UI and the API always agree.
 */
export const TEXT_LIMITS: Record<string, number> = {
  slug: 60,
  title: 120,
  name: 80,
  heading: 140,
  headline: 140,
  eyebrow: 60,
  label: 60,
  excerpt: 220,
  intro: 400,
  paragraph: 2000,
  description: 320,
  seoTitle: 70,
  seoDescription: 170,
  url: 300,
  phone: 30,
  email: 120,
  short: 120,
  long: 600,
};

export const limitFor = (key: string): number => TEXT_LIMITS[key] ?? 400;

/* ————— Format checks ————— */

export const isSlug = (v: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

export const isIsoDate = (v: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(`${v}T12:00:00`).getTime());

export const isTime = (v: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export const isEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isExternalUrl = (v: string): boolean =>
  /^https?:\/\/[^\s]+$/i.test(v);

/** Internal path ("/stores"), anchor ("/contact#faqs") or external http(s) URL. */
export const isHref = (v: string): boolean =>
  v.startsWith("/") || v.startsWith("#") || isExternalUrl(v);

/** Site-relative asset path, e.g. "/images/…" or "/uploads/…". */
export const isAssetPath = (v: string): boolean =>
  v === "" || (v.startsWith("/") && !v.includes(".."));
