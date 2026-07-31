import type { MetadataRoute } from "next";
import { events, legalPages, news, stores } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/stores`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/offers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/news`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];

  return [
    ...staticRoutes,
    ...stores.map((store) => ({
      url: `${SITE_URL}/stores/${store.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...news.map((article) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: new Date(`${article.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...legalPages.map((page) => ({
      url: `${SITE_URL}/legal/${page.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
