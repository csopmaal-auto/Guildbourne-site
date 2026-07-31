/**
 * SEO helpers — one place that turns the CMS seo collection into Next.js
 * metadata, plus a safe JSON-LD serializer.
 */
import type { Metadata } from "next";
import { seo, settings } from "@/lib/content";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.guildbournecentre.co.uk"
).replace(/\/$/, "");

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type Overrides = {
  title?: string;
  description?: string;
  image?: string;
  /** Detail pages (stores/news/events) pass their own path for canonical. */
  path?: string;
  type?: "website" | "article";
};

/**
 * Merge order: per-call overrides → seo.json route entry → global defaults.
 * Pages call `buildMetadata("/stores")`; detail pages add explicit overrides.
 */
export function buildMetadata(route: string, overrides: Overrides = {}): Metadata {
  const { global, routes } = seo;
  const entry = routes[route];

  const title = overrides.title || entry?.title || "";
  const description =
    overrides.description || entry?.description || global.defaultDescription;
  const image = overrides.image || global.ogImage;
  const path = overrides.path ?? route;
  const resolvedTitle = title
    ? global.titleTemplate.replace("%s", title)
    : global.defaultTitle;

  return {
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: overrides.type ?? "website",
      siteName: global.siteName,
      title: resolvedTitle,
      description,
      url: path,
      images: image ? [{ url: image, alt: global.siteName }] : undefined,
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      site: global.twitterHandle || undefined,
      title: resolvedTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * Serialize JSON-LD, escaping angle brackets so CMS text containing
 * "</script>" can never break out of the tag.
 */
export function jsonLdString(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

/* ————— Shared structured data ————— */

export function shoppingCentreJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ShoppingCenter",
    name: settings.siteName,
    description: settings.tagline,
    url: SITE_URL,
    telephone: settings.contact.phone,
    email: settings.contact.email,
    image: absoluteUrl(seo.global.ogImage || "/images/centre/exterior.jpg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.addressLine1,
      addressLocality: "Worthing",
      addressRegion: "West Sussex",
      postalCode: settings.contact.postcode,
      addressCountry: "GB",
    },
    openingHoursSpecification: openingHoursJsonLd(),
    sameAs: settings.socials.map((s) => s.url),
  };
}

function openingHoursJsonLd(): Record<string, unknown>[] {
  const dayMap: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };
  return Object.entries(settings.hours)
    .filter(([, h]) => !h.closed)
    .map(([day, h]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[day],
      opens: h.open,
      closes: h.close,
    }));
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
