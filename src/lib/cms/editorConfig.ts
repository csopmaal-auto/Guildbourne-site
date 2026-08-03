/**
 * Declarative editor layouts — what the admin forms render for each
 * collection. A new field on a collection = one line here (+ schema).
 *
 * `name` is a dot path into the collection data ("hero.primaryCta.label").
 * `limitKey` links the live character counter to TEXT_LIMITS.
 */
import {
  FACILITY_ICONS,
  OFFER_BADGES,
  SOCIAL_PLATFORMS,
  TILE_PALETTES,
  TILE_TYPES,
  TRAVEL_MODES,
} from "./options";

export type FieldDef =
  | { kind: "text"; name: string; label: string; limitKey?: string; hint?: string; required?: boolean }
  | { kind: "textarea"; name: string; label: string; limitKey?: string; hint?: string; rows?: number }
  | { kind: "markdown"; name: string; label: string; hint?: string; rows?: number }
  | { kind: "string-list"; name: string; label: string; hint?: string; limitKey?: string }
  | { kind: "image"; name: string; label: string; hint?: string }
  | { kind: "toggle"; name: string; label: string; hint?: string }
  | { kind: "select"; name: string; label: string; options: readonly string[]; hint?: string }
  | { kind: "date"; name: string; label: string; hint?: string }
  | { kind: "hours"; name: string; label: string }
  | { kind: "ref-select"; name: string; label: string; collection: string; hint?: string; allowEmpty?: boolean }
  | { kind: "ref-multi"; name: string; label: string; collection: string; hint?: string }
  | { kind: "record-list"; name: string; label: string; keyLabel: string; fields: FieldDef[]; hint?: string }
  | {
      kind: "object-list";
      name: string;
      label: string;
      fields: FieldDef[];
      itemLabelField?: string;
      hint?: string;
    };

export type EditorSection = {
  title: string;
  description?: string;
  fields: FieldDef[];
};

/* Shared sub-layouts */

const sectionHeadingFields = (name: string, withCta = true): FieldDef[] => [
  { kind: "text", name: `${name}.eyebrow`, label: "Eyebrow", limitKey: "eyebrow" },
  { kind: "text", name: `${name}.heading`, label: "Heading", limitKey: "heading", required: true },
  { kind: "textarea", name: `${name}.intro`, label: "Intro", limitKey: "intro", rows: 2 },
  ...(withCta
    ? [{ kind: "text", name: `${name}.ctaLabel`, label: "Button label", limitKey: "label" } satisfies FieldDef]
    : []),
];

const socialLinksField = (name: string): FieldDef => ({
  kind: "object-list",
  name,
  label: "Social links",
  itemLabelField: "platform",
  fields: [
    { kind: "select", name: "platform", label: "Platform", options: SOCIAL_PLATFORMS },
    { kind: "text", name: "url", label: "URL", limitKey: "url", required: true },
  ],
});

const navLinksFields: FieldDef[] = [
  { kind: "text", name: "label", label: "Label", limitKey: "label", required: true },
  { kind: "text", name: "href", label: "Link", limitKey: "url", required: true },
];

/* ————— Object-collection editors ————— */

export const objectEditors: Record<string, EditorSection[]> = {
  settings: [
    {
      title: "Identity",
      fields: [
        { kind: "text", name: "siteName", label: "Site name", limitKey: "name", required: true },
        { kind: "text", name: "tagline", label: "Tagline", limitKey: "short" },
        { kind: "text", name: "operator", label: "Operator", limitKey: "name" },
      ],
    },
    {
      title: "Contact details",
      fields: [
        { kind: "text", name: "contact.phone", label: "Phone", limitKey: "phone" },
        { kind: "text", name: "contact.email", label: "Email", limitKey: "email" },
        { kind: "text", name: "contact.addressLine1", label: "Address line 1", limitKey: "short" },
        { kind: "text", name: "contact.addressLine2", label: "Address line 2", limitKey: "short" },
        { kind: "text", name: "contact.postcode", label: "Postcode", limitKey: "phone" },
        { kind: "text", name: "contact.postalAddress", label: "Postal address (one line)", limitKey: "long" },
        { kind: "text", name: "contact.mapLink", label: "Google Maps link", limitKey: "url" },
      ],
    },
    {
      title: "Opening hours",
      description: "Used for the open-now indicator and shown across the site.",
      fields: [
        { kind: "hours", name: "hours", label: "Weekly hours" },
        {
          kind: "object-list",
          name: "hoursDisplay",
          label: "Hours as displayed",
          itemLabelField: "label",
          hint: "The friendly rows shown in the footer and contact page.",
          fields: [
            { kind: "text", name: "label", label: "Label", limitKey: "label", required: true },
            { kind: "text", name: "value", label: "Times", limitKey: "short", required: true },
          ],
        },
        { kind: "text", name: "hoursNote", label: "Holiday note", limitKey: "long" },
      ],
    },
    {
      title: "Social media",
      fields: [socialLinksField("socials")],
    },
    {
      title: "Announcement bar",
      description: "The slim bar above the navigation.",
      fields: [
        { kind: "toggle", name: "announcement.enabled", label: "Show announcement bar" },
        { kind: "text", name: "announcement.text", label: "Text", limitKey: "short" },
        { kind: "text", name: "announcement.link", label: "Link", limitKey: "url" },
        { kind: "text", name: "announcement.linkLabel", label: "Link label", limitKey: "label" },
      ],
    },
    {
      title: "Newsletter",
      fields: [
        {
          kind: "text",
          name: "newsletter.endpoint",
          label: "Provider endpoint",
          limitKey: "url",
          hint: "Optional — a URL that accepts {\"email\": …} POSTs (e.g. your email provider's hook).",
        },
      ],
    },
  ],

  navigation: [
    {
      title: "Header menu",
      fields: [
        {
          kind: "object-list",
          name: "header",
          label: "Menu items",
          itemLabelField: "label",
          fields: navLinksFields,
        },
      ],
    },
    {
      title: "Footer columns",
      fields: [
        {
          kind: "object-list",
          name: "footerColumns",
          label: "Columns",
          itemLabelField: "title",
          fields: [
            { kind: "text", name: "title", label: "Column title", limitKey: "label", required: true },
            {
              kind: "object-list",
              name: "links",
              label: "Links",
              itemLabelField: "label",
              fields: navLinksFields,
            },
          ],
        },
      ],
    },
    {
      title: "Legal links",
      fields: [
        {
          kind: "object-list",
          name: "legal",
          label: "Links",
          itemLabelField: "label",
          fields: navLinksFields,
        },
      ],
    },
  ],

  homepage: [
    {
      title: "Hero slides",
      description: "The rotating full-height banner on the left of the homepage.",
      fields: [
        {
          kind: "object-list",
          name: "hero.slides",
          label: "Slides",
          itemLabelField: "headline",
          fields: [
            { kind: "image", name: "image", label: "Image" },
            { kind: "text", name: "headline", label: "Headline", limitKey: "headline", required: true },
            { kind: "textarea", name: "subheadline", label: "Subheadline", limitKey: "intro", rows: 2 },
            { kind: "text", name: "cta.label", label: "Button label", limitKey: "label" },
            { kind: "text", name: "cta.href", label: "Button link", limitKey: "url" },
          ],
        },
      ],
    },
    {
      title: "Tiles",
      description: "The mosaic of cards on the right of the homepage — the site's main navigation.",
      fields: [
        {
          kind: "object-list",
          name: "tiles",
          label: "Tiles",
          itemLabelField: "title",
          fields: [
            { kind: "select", name: "type", label: "Tile type", options: TILE_TYPES },
            { kind: "text", name: "title", label: "Title", limitKey: "label", required: true },
            { kind: "textarea", name: "subtitle", label: "Subtitle", limitKey: "excerpt", rows: 2 },
            { kind: "text", name: "href", label: "Link", limitKey: "url", required: true },
            { kind: "image", name: "image", label: "Image (image tiles)" },
            { kind: "select", name: "palette", label: "Colour (colour tiles)", options: TILE_PALETTES },
            { kind: "toggle", name: "pattern", label: "Decorative squiggle (colour tiles)" },
          ],
        },
      ],
    },
    {
      title: "Newsletter",
      description: "Copy for the newsletter panel and footer form.",
      fields: [
        { kind: "text", name: "newsletter.heading", label: "Heading", limitKey: "heading", required: true },
        { kind: "textarea", name: "newsletter.body", label: "Body", limitKey: "intro", rows: 2 },
        { kind: "text", name: "newsletter.disclaimer", label: "Disclaimer", limitKey: "short" },
      ],
    },
  ],

  pages: [
    { title: "Stores page", fields: sectionHeadingFields("stores", false) },
    { title: "Offers page", fields: sectionHeadingFields("offers", false) },
    { title: "Events page", fields: sectionHeadingFields("events", false) },
    { title: "News page", fields: sectionHeadingFields("news", false) },
  ],

  contact: [
    { title: "Page header", fields: sectionHeadingFields("header", false) },
    {
      title: "Enquiry form",
      fields: [
        { kind: "text", name: "form.heading", label: "Heading", limitKey: "heading", required: true },
        { kind: "textarea", name: "form.intro", label: "Intro", limitKey: "intro", rows: 2 },
        { kind: "string-list", name: "form.subjects", label: "Subject options", limitKey: "label" },
        { kind: "text", name: "form.successHeading", label: "Success heading", limitKey: "heading" },
        { kind: "textarea", name: "form.successBody", label: "Success message", limitKey: "intro", rows: 2 },
      ],
    },
    {
      title: "Getting here",
      fields: [
        {
          kind: "object-list",
          name: "gettingHere",
          label: "Travel modes",
          itemLabelField: "title",
          fields: [
            { kind: "select", name: "mode", label: "Icon", options: TRAVEL_MODES },
            { kind: "text", name: "title", label: "Title", limitKey: "label", required: true },
            { kind: "textarea", name: "body", label: "Body", limitKey: "long", rows: 2 },
          ],
        },
        { kind: "text", name: "map.query", label: "Map search query", limitKey: "short", hint: "What the embedded map searches for." },
        { kind: "text", name: "map.linkLabel", label: "Map link label", limitKey: "label" },
      ],
    },
    {
      title: "Floorplan",
      fields: [
        { kind: "text", name: "floorplan.heading", label: "Heading", limitKey: "heading" },
        { kind: "textarea", name: "floorplan.body", label: "Body", limitKey: "intro", rows: 2 },
        { kind: "image", name: "floorplan.image", label: "Floorplan image" },
        { kind: "text", name: "floorplan.caption", label: "Caption", limitKey: "short" },
      ],
    },
    {
      title: "FAQs",
      fields: [
        {
          kind: "object-list",
          name: "faqs",
          label: "Questions",
          itemLabelField: "question",
          fields: [
            { kind: "text", name: "question", label: "Question", limitKey: "short", required: true },
            { kind: "textarea", name: "answer", label: "Answer", limitKey: "paragraph", rows: 3 },
          ],
        },
      ],
    },
    {
      title: "Retail lettings",
      fields: [
        { kind: "text", name: "letting.heading", label: "Heading", limitKey: "heading" },
        { kind: "textarea", name: "letting.body", label: "Body", limitKey: "intro", rows: 2 },
        { kind: "text", name: "letting.agent", label: "Agent", limitKey: "name" },
        { kind: "text", name: "letting.phone", label: "Agent phone", limitKey: "phone" },
      ],
    },
  ],

  seo: [
    {
      title: "Site-wide defaults",
      fields: [
        { kind: "text", name: "global.siteName", label: "Site name", limitKey: "name", required: true },
        { kind: "text", name: "global.titleTemplate", label: "Title template", limitKey: "label", hint: "%s is replaced with the page title." },
        { kind: "text", name: "global.defaultTitle", label: "Default title", limitKey: "seoTitle" },
        { kind: "textarea", name: "global.defaultDescription", label: "Default description", limitKey: "seoDescription", rows: 2 },
        { kind: "image", name: "global.ogImage", label: "Social sharing image" },
        { kind: "text", name: "global.twitterHandle", label: "X / Twitter handle", limitKey: "label" },
      ],
    },
    {
      title: "Per-page overrides",
      description: "Leave a field empty to fall back to the defaults above.",
      fields: [
        {
          kind: "record-list",
          name: "routes",
          label: "Pages",
          keyLabel: "Route",
          fields: [
            { kind: "text", name: "title", label: "Title", limitKey: "seoTitle" },
            { kind: "textarea", name: "description", label: "Description", limitKey: "seoDescription", rows: 2 },
          ],
        },
      ],
    },
  ],
};

/* ————— List-collection entry editors ————— */

export const entryEditors: Record<string, FieldDef[]> = {
  stores: [
    { kind: "text", name: "name", label: "Name", limitKey: "name", required: true },
    { kind: "text", name: "category", label: "Category", limitKey: "label", required: true, hint: "Reuse an existing category where possible — filters are built from these." },
    { kind: "text", name: "unit", label: "Unit", limitKey: "label" },
    { kind: "text", name: "excerpt", label: "Card excerpt", limitKey: "excerpt" },
    { kind: "markdown", name: "description", label: "Description", rows: 8 },
    { kind: "text", name: "phone", label: "Phone", limitKey: "phone" },
    { kind: "text", name: "email", label: "Email", limitKey: "email" },
    { kind: "text", name: "website", label: "Website", limitKey: "url" },
    socialLinksField("socials"),
    { kind: "image", name: "logo", label: "Logo" },
    { kind: "image", name: "image", label: "Photo (optional)" },
    { kind: "toggle", name: "featured", label: "Featured store" },
    { kind: "text", name: "hoursNote", label: "Hours note", limitKey: "short", hint: "Optional — shown instead of centre hours if this store differs." },
  ],
  offers: [
    { kind: "text", name: "title", label: "Title", limitKey: "title", required: true },
    { kind: "ref-select", name: "store", label: "Linked store", collection: "stores", allowEmpty: true },
    { kind: "select", name: "badge", label: "Badge", options: OFFER_BADGES },
    { kind: "date", name: "validUntil", label: "Valid until", hint: "Optional — adds an end date + countdown." },
    { kind: "textarea", name: "excerpt", label: "Card excerpt", limitKey: "excerpt", rows: 2 },
    { kind: "markdown", name: "body", label: "Details", rows: 5 },
    { kind: "image", name: "image", label: "Image (optional)" },
    { kind: "text", name: "cta.label", label: "Button label", limitKey: "label" },
    { kind: "text", name: "cta.href", label: "Button link", limitKey: "url" },
  ],
  events: [
    { kind: "text", name: "title", label: "Title", limitKey: "title", required: true },
    { kind: "date", name: "startDate", label: "Start date" },
    { kind: "date", name: "endDate", label: "End date", hint: "Optional — for multi-day events." },
    { kind: "text", name: "timeLabel", label: "Time", limitKey: "label", hint: "e.g. 10:00am – 4:00pm" },
    { kind: "text", name: "location", label: "Location", limitKey: "label" },
    { kind: "textarea", name: "excerpt", label: "Card excerpt", limitKey: "excerpt", rows: 2 },
    { kind: "markdown", name: "body", label: "Details", rows: 6 },
    { kind: "image", name: "image", label: "Image (optional)" },
    { kind: "toggle", name: "featured", label: "Featured event" },
  ],
  news: [
    { kind: "text", name: "title", label: "Title", limitKey: "title", required: true },
    { kind: "date", name: "date", label: "Date" },
    { kind: "text", name: "category", label: "Category", limitKey: "label" },
    { kind: "textarea", name: "excerpt", label: "Card excerpt", limitKey: "excerpt", rows: 2 },
    { kind: "markdown", name: "body", label: "Article body", rows: 10 },
    { kind: "image", name: "image", label: "Image (optional)" },
    { kind: "toggle", name: "featured", label: "Featured article" },
  ],
  facilities: [
    { kind: "text", name: "title", label: "Title", limitKey: "label", required: true },
    { kind: "select", name: "icon", label: "Icon", options: FACILITY_ICONS },
    { kind: "textarea", name: "description", label: "Description", limitKey: "description", rows: 2 },
  ],
  legal: [
    { kind: "text", name: "title", label: "Title", limitKey: "title", required: true },
    { kind: "date", name: "updated", label: "Last updated" },
    { kind: "markdown", name: "body", label: "Body", rows: 14 },
  ],
};

/** Public URL for a list entry, for "view on site" links. */
export function publicPathFor(collectionId: string, slug: string): string | null {
  switch (collectionId) {
    case "stores":
      return `/stores/${slug}`;
    case "events":
      return `/events/${slug}`;
    case "news":
      return `/news/${slug}`;
    case "legal":
      return `/legal/${slug}`;
    case "offers":
      return "/offers";
    case "facilities":
      return "/#facilities";
    default:
      return null;
  }
}
