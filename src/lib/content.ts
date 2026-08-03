/**
 * Typed content layer — the single import surface for all site content.
 *
 * The public site imports ONLY from this module (never from the JSON files
 * directly), so content stays statically bundled at build time and every
 * consumer shares one set of types. The CMS reads/writes the same JSON files
 * through the admin API — see `src/lib/cms/registry.ts`.
 */
import settingsRaw from "@/content/settings.json";
import navigationRaw from "@/content/navigation.json";
import homepageRaw from "@/content/homepage.json";
import pagesRaw from "@/content/pages.json";
import contactRaw from "@/content/contact.json";
import seoRaw from "@/content/seo.json";
import storesRaw from "@/content/stores.json";
import eventsRaw from "@/content/events.json";
import newsRaw from "@/content/news.json";
import offersRaw from "@/content/offers.json";
import facilitiesRaw from "@/content/facilities.json";
import legalRaw from "@/content/legal.json";

import type {
  CentreEvent,
  ContactContent,
  Facility,
  Homepage,
  LegalPage,
  Navigation,
  NewsArticle,
  Offer,
  Pages,
  SeoContent,
  Settings,
  Store,
} from "@/types/content";

export const settings = settingsRaw as unknown as Settings;
export const navigation = navigationRaw as unknown as Navigation;
export const homepage = homepageRaw as unknown as Homepage;
export const pages = pagesRaw as unknown as Pages;
export const contact = contactRaw as unknown as ContactContent;
export const seo = seoRaw as unknown as SeoContent;
export const stores = storesRaw as unknown as Store[];
export const events = eventsRaw as unknown as CentreEvent[];
export const news = newsRaw as unknown as NewsArticle[];
export const offers = offersRaw as unknown as Offer[];
export const facilities = facilitiesRaw as unknown as Facility[];
export const legalPages = legalRaw as unknown as LegalPage[];

/* ————— Derived helpers (pure, build-time safe) ————— */

const collator = new Intl.Collator("en-GB", { sensitivity: "base" });

/** Stores sorted alphabetically by name. */
export const storesAlphabetical = [...stores].sort((a, b) =>
  collator.compare(a.name, b.name),
);

/** Unique store categories, alphabetical. */
export const storeCategories = [
  ...new Set(stores.map((s) => s.category)),
].sort(collator.compare);

export const getStore = (slug: string): Store | undefined =>
  stores.find((s) => s.slug === slug);

export const getEvent = (slug: string): CentreEvent | undefined =>
  events.find((e) => e.slug === slug);

export const getArticle = (slug: string): NewsArticle | undefined =>
  news.find((n) => n.slug === slug);

export const getLegalPage = (slug: string): LegalPage | undefined =>
  legalPages.find((l) => l.slug === slug);

/** Stores related to the given one — same category first, then neighbours. */
export function relatedStores(store: Store, count = 4): Store[] {
  const sameCategory = storesAlphabetical.filter(
    (s) => s.slug !== store.slug && s.category === store.category,
  );
  if (sameCategory.length >= count) return sameCategory.slice(0, count);
  const others = storesAlphabetical.filter(
    (s) => s.slug !== store.slug && s.category !== store.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}

/** Offers linked to a store. */
export const offersForStore = (slug: string): Offer[] =>
  offers.filter((o) => o.store === slug);

/** News sorted newest first. */
export const newsByDate = [...news].sort((a, b) =>
  b.date.localeCompare(a.date),
);

/** Events sorted soonest first. */
export const eventsByDate = [...events].sort((a, b) =>
  a.startDate.localeCompare(b.startDate),
);

/** An event counts as upcoming until the end of its last day. */
export function isUpcoming(event: CentreEvent, now = new Date()): boolean {
  const last = event.endDate || event.startDate;
  return new Date(`${last}T23:59:59`) >= now;
}
