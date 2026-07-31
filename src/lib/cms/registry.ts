/**
 * ★ The collection registry — one entry per editable content file.
 *
 * The admin API and the dashboard both read this. Adding a new content type
 * = one entry here (+ a validator in schemas.ts and, for object collections,
 * a field layout in editorConfig.ts).
 */
import {
  contactSchema,
  eventEntrySchema,
  facilityEntrySchema,
  homepageSchema,
  legalEntrySchema,
  navigationSchema,
  newsEntrySchema,
  offerEntrySchema,
  pagesSchema,
  seoSchema,
  settingsSchema,
  storeEntrySchema,
  validateListWith,
  validateWith,
  type Validator,
} from "./schemas";

type ListEntry = Record<string, unknown> & { slug: string };

export type Collection = {
  /** URL-safe id used in API + edit routes. */
  id: string;
  /** Shown in the dashboard. */
  label: string;
  /** One-line description for the dashboard card. */
  description: string;
  /** Repo-relative path of the JSON file. */
  file: string;
  mode: "object" | "list";
  validate: Validator;
  /** Admin route for object editors (list collections use the generic editor). */
  editPath?: string;
  /** Dashboard grouping. */
  group: "Site" | "Pages" | "Directory & stories";
  /** List mode: build a fresh entry from a title + server-generated slug. */
  template?: (title: string, slug: string) => ListEntry;
  /** List mode: fields shown in the entry list (first = title). */
  listFields?: { primary: string; secondary?: string };
};

const today = () => new Date().toISOString().slice(0, 10);

export const collections: Collection[] = [
  {
    id: "settings",
    label: "Site settings",
    description: "Name, contact details, opening hours, socials & announcement bar.",
    file: "src/content/settings.json",
    mode: "object",
    validate: validateWith(settingsSchema),
    editPath: "/admin/settings",
    group: "Site",
  },
  {
    id: "navigation",
    label: "Navigation",
    description: "Header menu, footer link columns and legal links.",
    file: "src/content/navigation.json",
    mode: "object",
    validate: validateWith(navigationSchema),
    editPath: "/admin/navigation",
    group: "Site",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Titles, descriptions and social sharing defaults per page.",
    file: "src/content/seo.json",
    mode: "object",
    validate: validateWith(seoSchema),
    editPath: "/admin/seo",
    group: "Site",
  },
  {
    id: "homepage",
    label: "Homepage",
    description: "Hero, welcome, featured stores and every homepage section.",
    file: "src/content/homepage.json",
    mode: "object",
    validate: validateWith(homepageSchema),
    editPath: "/admin/homepage",
    group: "Pages",
  },
  {
    id: "pages",
    label: "Page headers",
    description: "Intro headings for the stores, offers, events and news pages.",
    file: "src/content/pages.json",
    mode: "object",
    validate: validateWith(pagesSchema),
    editPath: "/admin/pages",
    group: "Pages",
  },
  {
    id: "contact",
    label: "Visit & contact",
    description: "Contact page — form, directions, floorplan, FAQs and lettings.",
    file: "src/content/contact.json",
    mode: "object",
    validate: validateWith(contactSchema),
    editPath: "/admin/contact",
    group: "Pages",
  },
  {
    id: "stores",
    label: "Stores",
    description: "The store directory — one entry per store.",
    file: "src/content/stores.json",
    mode: "list",
    validate: validateListWith(storeEntrySchema),
    group: "Directory & stories",
    listFields: { primary: "name", secondary: "category" },
    template: (title, slug) => ({
      slug,
      name: title,
      category: "Services",
      unit: "",
      excerpt: "",
      description: [],
      phone: "",
      email: "",
      website: "",
      socials: [],
      logo: "",
      image: "",
      featured: false,
      hoursNote: "",
    }),
  },
  {
    id: "offers",
    label: "Offers",
    description: "Promotions and store highlights.",
    file: "src/content/offers.json",
    mode: "list",
    validate: validateListWith(offerEntrySchema),
    group: "Directory & stories",
    listFields: { primary: "title", secondary: "badge" },
    template: (title, slug) => ({
      slug,
      title,
      store: "",
      badge: "In store",
      validUntil: "",
      excerpt: "",
      body: [],
      image: "",
      cta: { label: "", href: "" },
    }),
  },
  {
    id: "events",
    label: "Events",
    description: "What's on — upcoming and past events.",
    file: "src/content/events.json",
    mode: "list",
    validate: validateListWith(eventEntrySchema),
    group: "Directory & stories",
    listFields: { primary: "title", secondary: "startDate" },
    template: (title, slug) => ({
      slug,
      title,
      startDate: today(),
      endDate: "",
      timeLabel: "",
      location: "Central Mall",
      excerpt: "",
      body: [],
      image: "",
      featured: false,
    }),
  },
  {
    id: "news",
    label: "News",
    description: "Centre news and editorial stories.",
    file: "src/content/news.json",
    mode: "list",
    validate: validateListWith(newsEntrySchema),
    group: "Directory & stories",
    listFields: { primary: "title", secondary: "date" },
    template: (title, slug) => ({
      slug,
      title,
      date: today(),
      category: "Centre news",
      excerpt: "",
      body: [],
      image: "",
      featured: false,
    }),
  },
  {
    id: "facilities",
    label: "Facilities",
    description: "The icon cards in the homepage facilities section.",
    file: "src/content/facilities.json",
    mode: "list",
    validate: validateListWith(facilityEntrySchema),
    group: "Directory & stories",
    listFields: { primary: "title", secondary: "icon" },
    template: (title, slug) => ({
      slug,
      title,
      icon: "sparkles",
      description: "",
    }),
  },
  {
    id: "legal",
    label: "Legal pages",
    description: "Privacy, cookies and accessibility statements.",
    file: "src/content/legal.json",
    mode: "list",
    validate: validateListWith(legalEntrySchema),
    group: "Pages",
    listFields: { primary: "title", secondary: "updated" },
    template: (title, slug) => ({
      slug,
      title,
      updated: today(),
      body: [],
    }),
  },
];

const byId = Object.fromEntries(collections.map((c) => [c.id, c]));

export const getCollection = (id: string): Collection | undefined => byId[id];

export const labelForFile = (file: string): string =>
  collections.find((c) => c.file === file)?.label ?? file;
