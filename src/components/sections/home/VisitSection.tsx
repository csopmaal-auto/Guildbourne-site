import Link from "next/link";
import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenNowBadge } from "@/components/ui/open-now";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import type { Homepage, Settings } from "@/types/content";

/** Full-bleed charcoal visit band: hours, live open state, address, CTAs. */
export function VisitSection({
  visit,
  settings,
}: {
  visit: Homepage["visit"];
  settings: Settings;
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal bg-grain py-24 text-ivory sm:py-32">
      <div className="container-site relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow-light">{visit.eyebrow}</p>
            <h2 className="heading-2 mt-4">{visit.heading}</h2>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.85] text-ivory/70 sm:text-base">
              {visit.body}
            </p>

            <OpenNowBadge hours={settings.hours} tone="dark" className="mt-7" />

            <dl className="mt-8 max-w-md space-y-3 border-t border-ivory/10 pt-7 text-sm">
              {settings.hoursDisplay.map((row) => (
                <div key={row.label} className="flex justify-between gap-6">
                  <dt className="text-ivory/60">{row.label}</dt>
                  <dd className="font-semibold text-ivory">{row.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-7 flex items-start gap-2.5 text-sm text-ivory/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              {settings.contact.addressLine1}, {settings.contact.addressLine2},{" "}
              {settings.contact.postcode}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="xl">
                <Link href="/contact">Plan your visit</Link>
              </Button>
              {settings.contact.mapLink ? (
                <Button asChild variant="outline-light" size="xl">
                  <a
                    href={settings.contact.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Directions <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4] lg:aspect-[4/5]">
                <Parallax strength={8} className="absolute -inset-y-10 inset-x-0">
                  {visit.image ? (
                    <Image
                      src={visit.image}
                      alt="The Guildbourne Centre, Worthing"
                      fill
                      sizes="(min-width:1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </Parallax>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent"
                />
              </div>
              <span
                aria-hidden
                className="absolute -top-4 -left-4 -z-10 size-40 border border-gold/40 sm:-top-6 sm:-left-6 sm:size-56"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
