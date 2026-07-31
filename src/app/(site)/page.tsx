import type { Metadata } from "next";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { WelcomeSection } from "@/components/sections/home/WelcomeSection";
import { FeaturedStores } from "@/components/sections/home/FeaturedStores";
import { OffersSection } from "@/components/sections/home/OffersSection";
import { EventsSection } from "@/components/sections/home/EventsSection";
import { NewsSection } from "@/components/sections/home/NewsSection";
import { FacilitiesSection } from "@/components/sections/home/FacilitiesSection";
import { VisitSection } from "@/components/sections/home/VisitSection";
import { SocialSection } from "@/components/sections/home/SocialSection";
import { NewsletterSection } from "@/components/sections/home/NewsletterSection";
import {
  eventsByDate,
  facilities,
  featuredStores,
  homepage,
  isUpcoming,
  newsByDate,
  offers,
  settings,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/");

export default function HomePage() {
  const upcomingEvents = eventsByDate.filter((e) => isUpcoming(e));
  const eventsToShow = upcomingEvents.length
    ? upcomingEvents
    : eventsByDate.slice(-3);

  return (
    <>
      <HomeHero hero={homepage.hero} />
      <WelcomeSection intro={homepage.intro} />
      <FeaturedStores heading={homepage.storesSection} stores={featuredStores} />
      <OffersSection heading={homepage.offersSection} offers={offers} />
      <EventsSection heading={homepage.eventsSection} events={eventsToShow} />
      <NewsSection heading={homepage.newsSection} articles={newsByDate} />
      <FacilitiesSection
        heading={homepage.facilitiesSection}
        facilities={facilities}
      />
      <VisitSection visit={homepage.visit} settings={settings} />
      <SocialSection social={homepage.social} settings={settings} />
      <NewsletterSection newsletter={homepage.newsletter} />
    </>
  );
}

// Static generation with content from the build — revalidation happens by
// rebuilding (the CMS publish action).
export const dynamic = "force-static";
