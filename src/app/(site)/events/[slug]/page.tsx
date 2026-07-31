import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/media";
import { Prose } from "@/components/ui/prose";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { EventCard } from "@/components/sections/EventCard";
import { events, eventsByDate, getEvent, isUpcoming, settings } from "@/lib/content";
import {
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdString,
} from "@/lib/seo";
import { formatDateRange } from "@/utils/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const event = getEvent((await params).slug);
  if (!event) return {};
  return buildMetadata("/events", {
    title: event.title,
    description: event.excerpt,
    path: `/events/${event.slug}`,
    image: event.image || undefined,
  });
}

export default async function EventPage({ params }: Params) {
  const event = getEvent((await params).slug);
  if (!event) notFound();

  const others = eventsByDate
    .filter((e) => e.slug !== event.slug && isUpcoming(e))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.excerpt,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    image: event.image ? absoluteUrl(event.image) : undefined,
    url: `${SITE_URL}/events/${event.slug}`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: `${settings.siteName}${event.location ? ` — ${event.location}` : ""}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.contact.addressLine1,
        addressLocality: "Worthing",
        postalCode: settings.contact.postcode,
        addressCountry: "GB",
      },
    },
    organizer: { "@type": "Organization", name: settings.siteName, url: SITE_URL },
  };

  return (
    <article>
      <header className="bg-charcoal bg-grain pt-32 pb-12 text-ivory sm:pt-40 sm:pb-16">
        <div className="container-site">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] text-ivory/60 uppercase transition-colors hover:text-gold focus-gold"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> What&rsquo;s on
              </Link>
            </nav>
            <p className="eyebrow-light mt-8">
              {isUpcoming(event) ? "Upcoming event" : "Past event"}
            </p>
            <h1 className="heading-1 mt-3 max-w-4xl">{event.title}</h1>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ivory/75">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-gold" aria-hidden />
                {formatDateRange(event.startDate, event.endDate)}
              </span>
              {event.timeLabel ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4 text-gold" aria-hidden />
                  {event.timeLabel}
                </span>
              ) : null}
              {event.location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-gold" aria-hidden />
                  {event.location}
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="bg-ivory py-16 sm:py-20">
        <div className="container-narrow">
          {event.image ? (
            <Reveal className="mb-10">
              <CoverImage
                src={event.image}
                alt={event.title}
                sizes="(min-width:768px) 48rem, 100vw"
                className="aspect-[16/9]"
              />
            </Reveal>
          ) : null}
          <Reveal>
            <Prose paragraphs={event.body.length ? event.body : [event.excerpt]} />
          </Reveal>
          <Reveal className="mt-12 border-t border-charcoal/10 pt-8">
            <p className="text-sm text-muted-foreground">
              Questions about this event? Call us on{" "}
              <a
                href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                className="font-semibold text-bronze hover:underline"
              >
                {settings.contact.phone}
              </a>
              .
            </p>
            <Button asChild variant="outline-dark" size="xl" className="mt-6">
              <Link href="/contact">Plan your visit</Link>
            </Button>
          </Reveal>
        </div>
      </div>

      {others.length ? (
        <section className="bg-stone py-16 sm:py-20">
          <div className="container-site">
            <Reveal className="mb-10">
              <p className="eyebrow">More to look forward to</p>
              <h2 className="heading-2 mt-3">Coming up at the centre</h2>
            </Reveal>
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((e) => (
                <RevealItem key={e.slug}>
                  <EventCard event={e} className="h-full" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <Script
        id={`ld-event-${event.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Script
        id={`ld-breadcrumb-event-${event.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Events", path: "/events" },
              { name: event.title, path: `/events/${event.slug}` },
            ]),
          ),
        }}
      />
    </article>
  );
}

export const revalidate = 3600;
