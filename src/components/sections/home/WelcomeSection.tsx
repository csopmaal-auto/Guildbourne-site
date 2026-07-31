import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { Homepage } from "@/types/content";

/** Editorial welcome: offset split layout, parallax image, stat rail. */
export function WelcomeSection({ intro }: { intro: Homepage["intro"] }) {
  return (
    <section className="overflow-hidden bg-ivory py-24 sm:py-32">
      <div className="container-site">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">{intro.eyebrow}</p>
              <h2 className="heading-2 mt-4">{intro.heading}</h2>
              <span className="hairline-gold mt-7 block" aria-hidden />
            </Reveal>
            <RevealGroup className="mt-7 space-y-5">
              {intro.body.map((paragraph, i) => (
                <RevealItem key={i}>
                  <p className="text-[15px] leading-[1.85] text-muted-foreground sm:text-base">
                    {paragraph}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>

            {intro.stats.length ? (
              <RevealGroup className="mt-10 grid grid-cols-3 gap-6 border-t border-charcoal/10 pt-8">
                {intro.stats.map((stat) => (
                  <RevealItem key={stat.label}>
                    <p className="text-3xl font-extrabold tracking-tight text-charcoal sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      {stat.label}
                    </p>
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : null}
          </div>

          {/* Image, offset with parallax */}
          <div className="relative lg:col-span-7 lg:pl-10">
            <Reveal delay={0.15} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Parallax strength={8} className="absolute -inset-y-10 inset-x-0">
                  {intro.image ? (
                    <Image
                      src={intro.image}
                      alt="Inside the Guildbourne Centre"
                      fill
                      sizes="(min-width:1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </Parallax>
              </div>
              {/* Gold frame accent */}
              <span
                aria-hidden
                className="absolute -right-4 -bottom-4 -z-10 size-40 border border-gold/50 sm:-right-6 sm:-bottom-6 sm:size-56"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
