/**
 * Per-collection validators.
 *
 * Zod does the heavy lifting; every collection exposes a `validate(data)`
 * with the blueprint contract `{ ok: true } | { ok: false; errors: string[] }`
 * so the content API can stay generic. Limits come from `limits.ts` — the
 * same map that drives the editor's live counters.
 */
import { z } from "zod";
import {
  isAssetPath,
  isHref,
  isIsoDate,
  isSlug,
  isTime,
  limitFor,
} from "./limits";
import {
  FACILITY_ICONS,
  HERO_MEDIA_TYPES,
  SOCIAL_PLATFORMS,
  TRAVEL_MODES,
} from "./options";

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };
export type Validator = (data: unknown) => ValidationResult;

/* ————— Field primitives ————— */

const text = (key: string) => z.string().max(limitFor(key));
const requiredText = (key: string) => text(key).trim().min(1, "required");

const slugField = z
  .string()
  .min(1, "required")
  .max(limitFor("slug"))
  .refine(isSlug, "must be a lowercase-hyphen slug, e.g. my-page");

const hrefField = z
  .string()
  .min(1, "required")
  .max(limitFor("url"))
  .refine(isHref, "must be an internal path (/stores) or an http(s) URL");

const optionalUrl = z
  .string()
  .max(limitFor("url"))
  .refine((v) => v === "" || isHref(v), "must be an http(s) URL or empty");

const assetPath = z
  .string()
  .max(limitFor("url"))
  .refine(isAssetPath, "must be a site-relative path, e.g. /uploads/…");

const isoDate = z
  .string()
  .refine(isIsoDate, "must be an ISO date, e.g. 2026-08-15");

const optionalIsoDate = z
  .string()
  .refine((v) => v === "" || isIsoDate(v), "must be an ISO date or empty");

const timeField = z.string().refine(isTime, "must be 24h time, e.g. 09:30");

const emailField = z
  .string()
  .max(limitFor("email"))
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "must be an email or empty");

const paragraphs = z.array(text("paragraph")).max(40);

const ctaSchema = z.object({
  label: text("label"),
  href: z
    .string()
    .max(limitFor("url"))
    .refine((v) => v === "" || isHref(v), "must be a path/URL or empty"),
});

const navLink = z.object({ label: requiredText("label"), href: hrefField });

const socialLink = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: hrefField,
});

const dayHours = z.object({
  open: timeField,
  close: timeField,
  closed: z.boolean(),
});

const sectionHeading = z.object({
  eyebrow: text("eyebrow"),
  heading: requiredText("heading"),
  intro: text("intro").optional(),
  ctaLabel: text("label").optional(),
});

const pageHeader = z.object({
  eyebrow: text("eyebrow"),
  heading: requiredText("heading"),
  intro: text("intro"),
});

/* ————— Object collections ————— */

export const settingsSchema = z.object({
  siteName: requiredText("name"),
  tagline: text("short"),
  operator: text("name"),
  contact: z.object({
    phone: text("phone"),
    email: emailField,
    addressLine1: text("short"),
    addressLine2: text("short"),
    postcode: text("phone"),
    postalAddress: text("long"),
    mapLink: optionalUrl,
  }),
  hours: z.object({
    monday: dayHours,
    tuesday: dayHours,
    wednesday: dayHours,
    thursday: dayHours,
    friday: dayHours,
    saturday: dayHours,
    sunday: dayHours,
  }),
  hoursDisplay: z
    .array(z.object({ label: requiredText("label"), value: requiredText("short") }))
    .max(8),
  hoursNote: text("long"),
  socials: z.array(socialLink).max(8),
  announcement: z.object({
    enabled: z.boolean(),
    text: text("short"),
    link: z
      .string()
      .max(limitFor("url"))
      .refine((v) => v === "" || isHref(v), "must be a path/URL or empty"),
    linkLabel: text("label"),
  }),
  newsletter: z.object({ endpoint: optionalUrl }),
});

export const navigationSchema = z.object({
  header: z.array(navLink).min(1).max(8),
  footerColumns: z
    .array(z.object({ title: requiredText("label"), links: z.array(navLink).max(8) }))
    .max(4),
  legal: z.array(navLink).max(6),
});

export const homepageSchema = z.object({
  hero: z.object({
    eyebrow: text("eyebrow"),
    headline: requiredText("headline"),
    subheadline: text("intro"),
    mediaType: z.enum(HERO_MEDIA_TYPES),
    image: assetPath,
    videoUrl: assetPath,
    poster: assetPath,
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    scrollLabel: text("label"),
  }),
  intro: z.object({
    eyebrow: text("eyebrow"),
    heading: requiredText("heading"),
    body: paragraphs,
    image: assetPath,
    stats: z
      .array(z.object({ value: requiredText("label"), label: requiredText("short") }))
      .max(4),
  }),
  storesSection: sectionHeading,
  featuredStores: z.array(slugField).max(12),
  offersSection: sectionHeading,
  eventsSection: sectionHeading,
  newsSection: sectionHeading,
  facilitiesSection: sectionHeading,
  visit: z.object({
    eyebrow: text("eyebrow"),
    heading: requiredText("heading"),
    body: text("paragraph"),
    image: assetPath,
  }),
  social: z.object({
    heading: requiredText("heading"),
    intro: text("intro"),
    handle: text("label"),
    images: z.array(assetPath).max(8),
  }),
  newsletter: z.object({
    heading: requiredText("heading"),
    body: text("intro"),
    disclaimer: text("short"),
  }),
});

export const pagesSchema = z.object({
  stores: pageHeader,
  offers: pageHeader,
  events: pageHeader,
  news: pageHeader,
});

export const contactSchema = z.object({
  header: pageHeader,
  form: z.object({
    heading: requiredText("heading"),
    intro: text("intro"),
    subjects: z.array(requiredText("label")).min(1).max(10),
    successHeading: requiredText("heading"),
    successBody: text("intro"),
  }),
  gettingHere: z
    .array(
      z.object({
        mode: z.enum(TRAVEL_MODES),
        title: requiredText("label"),
        body: text("long"),
      }),
    )
    .max(4),
  map: z.object({ query: requiredText("short"), linkLabel: text("label") }),
  floorplan: z.object({
    heading: requiredText("heading"),
    body: text("intro"),
    image: assetPath,
    caption: text("short"),
  }),
  faqs: z
    .array(z.object({ question: requiredText("short"), answer: requiredText("paragraph") }))
    .max(12),
  letting: z.object({
    heading: requiredText("heading"),
    body: text("intro"),
    agent: text("name"),
    phone: text("phone"),
  }),
});

export const seoSchema = z.object({
  global: z.object({
    siteName: requiredText("name"),
    titleTemplate: requiredText("label").refine(
      (v) => v.includes("%s"),
      "must contain %s where the page title goes",
    ),
    defaultTitle: requiredText("seoTitle"),
    defaultDescription: text("seoDescription"),
    ogImage: assetPath,
    twitterHandle: text("label"),
  }),
  routes: z.record(
    z.string().refine((v) => v.startsWith("/"), "route keys start with /"),
    z.object({ title: text("seoTitle"), description: text("seoDescription") }),
  ),
});

/* ————— List collections ————— */

export const storeEntrySchema = z.object({
  slug: slugField,
  name: requiredText("name"),
  category: requiredText("label"),
  unit: text("label"),
  excerpt: text("excerpt"),
  description: paragraphs,
  phone: text("phone"),
  email: emailField,
  website: optionalUrl,
  socials: z.array(socialLink).max(6),
  logo: assetPath,
  image: assetPath,
  featured: z.boolean(),
  hoursNote: text("short"),
});

export const eventEntrySchema = z.object({
  slug: slugField,
  title: requiredText("title"),
  startDate: isoDate,
  endDate: optionalIsoDate,
  timeLabel: text("label"),
  location: text("label"),
  excerpt: text("excerpt"),
  body: paragraphs,
  image: assetPath,
  featured: z.boolean(),
});

export const newsEntrySchema = z.object({
  slug: slugField,
  title: requiredText("title"),
  date: isoDate,
  category: text("label"),
  excerpt: text("excerpt"),
  body: paragraphs,
  image: assetPath,
  featured: z.boolean(),
});

export const offerEntrySchema = z.object({
  slug: slugField,
  title: requiredText("title"),
  store: z
    .string()
    .max(limitFor("slug"))
    .refine((v) => v === "" || isSlug(v), "must be a store slug or empty"),
  badge: text("label"),
  validUntil: optionalIsoDate,
  excerpt: text("excerpt"),
  body: paragraphs,
  image: assetPath,
  cta: ctaSchema,
});

export const facilityEntrySchema = z.object({
  slug: slugField,
  title: requiredText("label"),
  icon: z.enum(FACILITY_ICONS),
  description: text("description"),
});

export const legalEntrySchema = z.object({
  slug: slugField,
  title: requiredText("title"),
  updated: isoDate,
  body: paragraphs,
});

/* ————— Contract adapters ————— */

function zodErrors(error: z.ZodError, prefix = ""): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${prefix}${path ? `${path}: ` : ""}${issue.message}`;
  });
}

/** Wrap a Zod schema in the blueprint's `{ ok, errors }` contract. */
export function validateWith(schema: z.ZodTypeAny): Validator {
  return (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) return { ok: true };
    return { ok: false, errors: zodErrors(result.error) };
  };
}

/** List collections: validate every entry and enforce slug uniqueness. */
export function validateListWith(entrySchema: z.ZodTypeAny): Validator {
  return (data: unknown) => {
    if (!Array.isArray(data)) {
      return { ok: false, errors: ["expected an array of entries"] };
    }
    const errors: string[] = [];
    const seen = new Set<string>();
    data.forEach((entry, i) => {
      const result = entrySchema.safeParse(entry);
      const label =
        typeof (entry as { slug?: unknown })?.slug === "string"
          ? (entry as { slug: string }).slug
          : `#${i + 1}`;
      if (!result.success) errors.push(...zodErrors(result.error, `${label} · `));
      const slug = (entry as { slug?: unknown })?.slug;
      if (typeof slug === "string") {
        if (seen.has(slug)) errors.push(`duplicate slug "${slug}"`);
        seen.add(slug);
      }
    });
    return errors.length ? { ok: false, errors } : { ok: true };
  };
}
