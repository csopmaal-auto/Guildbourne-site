import { SectionHeading } from "@/components/ui/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { EventCard } from "@/components/sections/EventCard";
import type { CentreEvent, SectionHeading as SectionHeadingContent } from "@/types/content";

export function EventsSection({
  heading,
  events,
}: {
  heading: SectionHeadingContent;
  events: CentreEvent[];
}) {
  if (events.length === 0) return null;

  return (
    <section className="bg-stone py-24 sm:py-32">
      <div className="container-site">
        <SectionHeading content={heading} ctaHref="/events" />
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <RevealItem key={event.slug}>
              <EventCard event={event} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
