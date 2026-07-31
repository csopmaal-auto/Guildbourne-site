import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenNowBadge } from "@/components/ui/open-now";
import { Prose } from "@/components/ui/prose";
import { SocialIconLink } from "@/components/ui/social-icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { OfferCard } from "@/components/sections/OfferCard";
import { StoreCard } from "@/components/sections/StoreCard";
import {
  getStore,
  offersForStore,
  relatedStores,
  settings,
  stores,
} from "@/lib/content";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdString,
} from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return stores.map((store) => ({ slug: store.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const store = getStore((await params).slug);
  if (!store) return {};
  return buildMetadata("/stores", {
    title: store.name,
    description:
      store.excerpt ||
      `${store.name} at the Guildbourne Centre, Worthing — opening hours, contact details and more.`,
    path: `/stores/${store.slug}`,
  });
}

export default async function StorePage({ params }: Params) {
  const store = getStore((await params).slug);
  if (!store) notFound();

  const offers = offersForStore(store.slug);
  const related = relatedStores(store, 4);
  const phoneHref = store.phone ? `tel:${store.phone.replace(/\s/g, "")}` : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    description: store.excerpt || undefined,
    image: store.logo ? absoluteUrl(store.logo) : undefined,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    url: `${SITE_URL}/stores/${store.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `Unit ${store.unit}, ${settings.contact.addressLine1}`,
      addressLocality: "Worthing",
      addressRegion: "West Sussex",
      postalCode: settings.contact.postcode,
      addressCountry: "GB",
    },
    containedInPlace: { "@type": "ShoppingCenter", name: settings.siteName },
  };

  return (
    <article>
      {/* Hero band */}
      <header className="bg-charcoal bg-grain pt-32 pb-12 text-ivory sm:pt-40 sm:pb-16">
        <div className="container-site">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/stores"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] text-ivory/60 uppercase transition-colors hover:text-gold focus-gold"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> Store directory
              </Link>
            </nav>

            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex h-32 w-44 shrink-0 items-center justify-center bg-white px-6 shadow-xl">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={`${store.name} logo`}
                    width={180}
                    height={90}
                    priority
                    className="max-h-20 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-extrabold text-charcoal/30">
                    {store.name}
                  </span>
                )}
              </div>
              <div>
                <p className="eyebrow-light">{store.category}</p>
                <h1 className="heading-1 mt-2">{store.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ivory/70">
                  {store.unit ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-gold" aria-hidden />
                      Unit {store.unit}
                    </span>
                  ) : null}
                  <OpenNowBadge hours={settings.hours} tone="dark" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {phoneHref ? (
                <Button asChild variant="gold" size="xl">
                  <a href={phoneHref}>
                    <Phone className="size-3.5" /> {store.phone}
                  </a>
                </Button>
              ) : null}
              {store.website ? (
                <Button asChild variant="outline-light" size="xl">
                  <a href={store.website} target="_blank" rel="noopener noreferrer">
                    Visit website <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </header>

      {/* Body */}
      <div className="bg-ivory py-16 sm:py-20">
        <div className="container-site grid gap-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <h2 className="eyebrow">About</h2>
              <span className="hairline-gold mt-4 mb-7 block" aria-hidden />
              {store.description.length ? (
                <Prose paragraphs={store.description} />
              ) : (
                <p className="text-muted-foreground">{store.excerpt}</p>
              )}
            </Reveal>

            {store.image ? (
              <Reveal className="mt-10">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    sizes="(min-width:1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : null}

            {offers.length ? (
              <Reveal className="mt-14">
                <h2 className="eyebrow">Offers & highlights</h2>
                <span className="hairline-gold mt-4 mb-7 block" aria-hidden />
                <div className="grid gap-6 sm:grid-cols-2">
                  {offers.map((offer) => (
                    <OfferCard key={offer.slug} offer={offer} />
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* Details sidebar */}
          <Reveal delay={0.1}>
            <aside className="border border-charcoal/10 bg-white p-7 lg:sticky lg:top-28">
              <h2 className="text-sm font-bold tracking-[0.2em] text-charcoal uppercase">
                Store details
              </h2>

              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="eyebrow text-[10px]">Opening hours</dt>
                  <dd className="mt-2 space-y-1.5 text-charcoal/80">
                    {settings.hoursDisplay.map((row) => (
                      <p key={row.label} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold">{row.value}</span>
                      </p>
                    ))}
                    {store.hoursNote ? (
                      <p className="pt-1 text-xs text-muted-foreground italic">
                        {store.hoursNote}
                      </p>
                    ) : null}
                  </dd>
                </div>

                {store.phone ? (
                  <div>
                    <dt className="eyebrow text-[10px]">Phone</dt>
                    <dd className="mt-1.5">
                      <a
                        href={phoneHref!}
                        className="link-underline inline-flex items-center gap-2 font-semibold text-charcoal focus-gold"
                      >
                        <Phone className="size-3.5 text-bronze" aria-hidden />
                        {store.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}

                {store.email ? (
                  <div>
                    <dt className="eyebrow text-[10px]">Email</dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${store.email}`}
                        className="link-underline inline-flex items-center gap-2 font-semibold break-all text-charcoal focus-gold"
                      >
                        <Mail className="size-3.5 shrink-0 text-bronze" aria-hidden />
                        {store.email}
                      </a>
                    </dd>
                  </div>
                ) : null}

                {store.website ? (
                  <div>
                    <dt className="eyebrow text-[10px]">Website</dt>
                    <dd className="mt-1.5">
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline inline-flex items-center gap-2 font-semibold break-all text-charcoal focus-gold"
                      >
                        <ExternalLink className="size-3.5 shrink-0 text-bronze" aria-hidden />
                        {store.website.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    </dd>
                  </div>
                ) : null}

                <div>
                  <dt className="eyebrow text-[10px]">Location</dt>
                  <dd className="mt-1.5 text-charcoal/80">
                    {store.unit ? `Unit ${store.unit}, ` : ""}
                    {settings.contact.addressLine1}
                    <Link
                      href="/contact#floorplan"
                      className="link-underline mt-1.5 block w-fit text-xs font-semibold tracking-wider text-bronze uppercase focus-gold"
                    >
                      View on the centre plan
                    </Link>
                  </dd>
                </div>
              </dl>

              {store.socials.length ? (
                <div className="mt-7 border-t border-charcoal/10 pt-6">
                  <p className="eyebrow text-[10px]">Follow</p>
                  <div className="mt-3 flex gap-2.5">
                    {store.socials.map((s) => (
                      <SocialIconLink
                        key={s.platform + s.url}
                        platform={s.platform}
                        url={s.url}
                        className="border-charcoal/15 text-charcoal/70 hover:border-gold hover:bg-gold hover:text-charcoal"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </Reveal>
        </div>
      </div>

      {/* Related stores */}
      {related.length ? (
        <section className="bg-stone py-16 sm:py-20">
          <div className="container-site">
            <Reveal className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Keep browsing</p>
                <h2 className="heading-2 mt-3">You might also like</h2>
              </div>
              <Link
                href="/stores"
                className="link-underline hidden pb-1 text-[11px] font-semibold tracking-[0.22em] text-bronze uppercase sm:block focus-gold"
              >
                All stores
              </Link>
            </Reveal>
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((s) => (
                <RevealItem key={s.slug}>
                  <StoreCard store={s} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <Script
        id={`ld-store-${store.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Script
        id={`ld-breadcrumb-${store.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Stores", path: "/stores" },
              { name: store.name, path: `/stores/${store.slug}` },
            ]),
          ),
        }}
      />
    </article>
  );
}
