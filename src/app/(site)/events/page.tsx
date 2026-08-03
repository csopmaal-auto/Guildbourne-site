import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventsExplorer } from "@/components/sections/events/EventsExplorer";
import { eventsByDate, isUpcoming, pages } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/events");
// Upcoming/past is computed at request time so the split never goes stale
// between publishes.
export const revalidate = 3600;

export default function EventsPage() {
  const upcoming = eventsByDate.filter((e) => isUpcoming(e));
  const past = eventsByDate.filter((e) => !isUpcoming(e)).reverse();

  return (
    <>
      <PageHeader content={pages.events} />
      <div className="bg-white">
        <EventsExplorer upcoming={upcoming} past={past} />
      </div>
    </>
  );
}
