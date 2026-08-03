import Script from "next/script";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { SearchItem } from "@/components/layout/SearchOverlay";
import { LenisProvider } from "@/components/motion/LenisProvider";
import {
  events,
  homepage,
  navigation,
  news,
  offers,
  settings,
  storesAlphabetical,
} from "@/lib/content";
import { jsonLdString, shoppingCentreJsonLd } from "@/lib/seo";

/** Compact client-side search index, built once at render from the content layer. */
function buildSearchIndex(): SearchItem[] {
  return [
    ...storesAlphabetical.map((s) => ({
      type: "Store" as const,
      title: s.name,
      subtitle: s.category,
      href: `/stores/${s.slug}`,
    })),
    ...offers.map((o) => ({
      type: "Offer" as const,
      title: o.title,
      subtitle: o.excerpt,
      href: "/offers",
    })),
    ...events.map((e) => ({
      type: "Event" as const,
      title: e.title,
      subtitle: e.location,
      href: `/events/${e.slug}`,
    })),
    ...news.map((n) => ({
      type: "News" as const,
      title: n.title,
      subtitle: n.category,
      href: `/news/${n.slug}`,
    })),
    { type: "Page", title: "Plan your visit", subtitle: "Hours, directions & contact", href: "/contact" },
    { type: "Page", title: "Store directory", subtitle: "Every store at the centre", href: "/stores" },
  ];
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <Header
        navigation={navigation}
        settings={settings}
        searchIndex={buildSearchIndex()}
        menuTiles={homepage.tiles.filter((t) => t.type === "image").slice(0, 2)}
        newsletter={homepage.newsletter}
      />
      <main id="content">{children}</main>
      <Footer />
      <Script
        id="ld-shopping-centre"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLdString(shoppingCentreJsonLd()) }}
      />
    </LenisProvider>
  );
}
