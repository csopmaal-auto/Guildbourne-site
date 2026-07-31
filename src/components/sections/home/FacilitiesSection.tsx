import { SectionHeading } from "@/components/ui/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FacilityCard } from "@/components/sections/FacilityCard";
import type { Facility, SectionHeading as SectionHeadingContent } from "@/types/content";

export function FacilitiesSection({
  heading,
  facilities,
}: {
  heading: SectionHeadingContent;
  facilities: Facility[];
}) {
  if (facilities.length === 0) return null;

  return (
    <section id="facilities" className="scroll-mt-24 bg-stone py-24 sm:py-32">
      <div className="container-site">
        <SectionHeading content={heading} align="center" />
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <RevealItem key={facility.slug}>
              <FacilityCard facility={facility} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
