import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
      <header className="bg-white pt-32 sm:pt-36">
        <div className="container-site">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/events"
                className="focus-brand inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs leading-none font-bold text-ink transition-colors hover:bg-sand"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> What&rsquo;s on
              </Link>
            </nav>
            <p className="mt-8 text-sm font-bold text-ink-soft">
              {isUpcoming(event) ? "Upcoming event" : "Past event"}
            </p>
            <h1 className="heading-xl mt-2 max-w-4xl text-ink lg:text-[2.75rem] lg:leading-[1.09]">
              {event.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3.5 py-1.5 text-xs leading-none font-bold text-ink">
                <CalendarDays className="size-3.5" aria-hidden />
                {formatDateRange(event.startDate, event.endDate)}
              </span>
              {event.timeLabel ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3.5 py-1.5 text-xs leading-none font-bold text-ink">
                  <Clock className="size-3.5" aria-hidden />
                  {event.timeLabel}
                </span>
              ) : null}
              {event.location ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3.5 py-1.5 text-xs leading-none font-bold text-ink">
                  <MapPin className="size-3.5" aria-hidden />
                  {event.location}
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="bg-white py-10 sm:py-12">
        <div className="container-narrow">
          {event.image ? (
            <Reveal className="mb-10">
              <CoverImage
                src={event.image}
                alt={event.title}
                sizes="(min-width:768px) 48rem, 100vw"
                className="aspect-[16/9] rounded-xl"
              />
            </Reveal>
          ) : null}
          <Reveal>
            <Prose paragraphs={event.body.length ? event.body : [event.excerpt]} />
          </Reveal>
          <Reveal className="mt-12 border-t border-sand pt-8">
            <p className="text-body text-ink-soft">
              Questions about this event? Call us on{" "}
              <a
                href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                className="font-bold text-ink hover:underline"
              >
                {settings.contact.phone}
              </a>
              .
            </p>
            <Button asChild variant="gold" size="xl" className="mt-6">
              <Link href="/contact">Plan your visit</Link>
            </Button>
          </Reveal>
        </div>
      </div>

      {others.length ? (
        <section className="bg-cream py-12 sm:py-16">
          <div className="container-site">
            <Reveal className="mb-8">
              <h2 className="heading-l text-ink">Coming up at the centre</h2>
            </Reveal>
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((e) => (
                <RevealItem key={e.slug}>
                  <EventCard event={e} className="h-full" />
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
