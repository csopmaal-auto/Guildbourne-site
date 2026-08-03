import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
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
    <article className="bg-white">
      {/* Hero panel */}
      <header className="container-site pt-32 sm:pt-36">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <Link
              href="/stores"
              className="focus-brand inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs leading-none font-bold text-ink transition-colors hover:bg-sand"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Store directory
            </Link>
          </nav>

          <div className="mt-6 overflow-hidden rounded-xxl bg-cream p-6 sm:p-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex h-32 w-44 shrink-0 items-center justify-center rounded-xl bg-white px-6">
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
                  <span className="font-title text-xl font-extrabold text-ink/30">
                    {store.name}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-ink-soft">{store.category}</p>
                <h1 className="heading-xl mt-1 text-ink lg:text-[2.75rem] lg:leading-[1.09]">
                  {store.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
                  {store.unit ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs leading-none font-bold text-ink">
                      <MapPin className="size-3.5" aria-hidden />
                      Unit {store.unit}
                    </span>
                  ) : null}
                  <OpenNowBadge hours={settings.hours} />
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
                <Button asChild variant="outline-dark" size="xl">
                  <a href={store.website} target="_blank" rel="noopener noreferrer">
                    Visit website <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </header>

      {/* Body */}
      <div className="container-site grid gap-10 py-12 lg:grid-cols-3 sm:py-16">
        <div className="lg:col-span-2">
          <Reveal>
            <h2 className="heading-l text-ink">About {store.name}</h2>
            <div className="mt-5">
              {store.description.length ? (
                <Prose paragraphs={store.description} />
              ) : (
                <p className="text-ink-soft">{store.excerpt}</p>
              )}
            </div>
          </Reveal>

          {store.image ? (
            <Reveal className="mt-10">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
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
            <Reveal className="mt-12">
              <h2 className="heading-l text-ink">Offers & highlights</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {offers.map((offer) => (
                  <OfferCard key={offer.slug} offer={offer} />
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>

        {/* Details sidebar */}
        <Reveal delay={0.1}>
          <aside className="rounded-xl bg-cream p-6 lg:sticky lg:top-6">
            <h2 className="heading-m text-ink">Store details</h2>

            <dl className="text-body mt-5 space-y-5">
              <div>
                <dt className="text-xs font-bold text-ink-soft uppercase">
                  Opening hours
                </dt>
                <dd className="mt-2 space-y-1.5 text-ink">
                  {settings.hoursDisplay.map((row) => (
                    <p key={row.label} className="flex justify-between gap-4">
                      <span className="text-ink-soft">{row.label}</span>
                      <span className="font-bold">{row.value}</span>
                    </p>
                  ))}
                  {store.hoursNote ? (
                    <p className="pt-1 text-xs text-ink-soft italic">
                      {store.hoursNote}
                    </p>
                  ) : null}
                </dd>
              </div>

              {store.phone ? (
                <div>
                  <dt className="text-xs font-bold text-ink-soft uppercase">Phone</dt>
                  <dd className="mt-1.5">
                    <a
                      href={phoneHref!}
                      className="focus-brand inline-flex items-center gap-2 rounded-sm font-bold text-ink hover:underline"
                    >
                      <Phone className="size-3.5 text-ink-soft" aria-hidden />
                      {store.phone}
                    </a>
                  </dd>
                </div>
              ) : null}

              {store.email ? (
                <div>
                  <dt className="text-xs font-bold text-ink-soft uppercase">Email</dt>
                  <dd className="mt-1.5">
                    <a
                      href={`mailto:${store.email}`}
                      className="focus-brand inline-flex items-center gap-2 rounded-sm font-bold break-all text-ink hover:underline"
                    >
                      <Mail className="size-3.5 shrink-0 text-ink-soft" aria-hidden />
                      {store.email}
                    </a>
                  </dd>
                </div>
              ) : null}

              {store.website ? (
                <div>
                  <dt className="text-xs font-bold text-ink-soft uppercase">Website</dt>
                  <dd className="mt-1.5">
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-brand inline-flex items-center gap-2 rounded-sm font-bold break-all text-ink hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0 text-ink-soft" aria-hidden />
                      {store.website.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </dd>
                </div>
              ) : null}

              <div>
                <dt className="text-xs font-bold text-ink-soft uppercase">Location</dt>
                <dd className="mt-1.5 text-ink">
                  {store.unit ? `Unit ${store.unit}, ` : ""}
                  {settings.contact.addressLine1}
                  <Link
                    href="/contact#floorplan"
                    className="focus-brand mt-1.5 block w-fit rounded-sm text-sm font-bold text-ink underline underline-offset-4 hover:text-ink-soft"
                  >
                    View on the centre plan
                  </Link>
                </dd>
              </div>
            </dl>

            {store.socials.length ? (
              <div className="mt-6 border-t border-sand pt-5">
                <p className="text-xs font-bold text-ink-soft uppercase">Follow</p>
                <div className="mt-3 flex gap-2.5">
                  {store.socials.map((s) => (
                    <SocialIconLink
                      key={s.platform + s.url}
                      platform={s.platform}
                      url={s.url}
                      className="border-sand bg-white text-ink-soft hover:border-yellow hover:bg-yellow hover:text-ink"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </Reveal>
      </div>

      {/* Related stores */}
      {related.length ? (
        <section className="bg-cream py-12 sm:py-16">
          <div className="container-site">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="heading-l text-ink">You might also like</h2>
              <Link
                href="/stores"
                className="focus-brand rounded-sm text-sm font-bold text-ink underline underline-offset-4 hover:text-ink-soft"
              >
                All stores
              </Link>
            </Reveal>
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((s) => (
                <RevealItem key={s.slug}>
                  <StoreCard store={s} className="h-full bg-white hover:bg-sand" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <script
        type="application/ld+json"
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
