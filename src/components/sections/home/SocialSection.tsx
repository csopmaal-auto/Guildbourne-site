import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SocialIconLink } from "@/components/ui/social-icon";
import type { Homepage, Settings } from "@/types/content";

/**
 * The social band. With images configured it becomes a photo strip;
 * without, it stays an elegant follow call-to-action.
 */
export function SocialSection({
  social,
  settings,
}: {
  social: Homepage["social"];
  settings: Settings;
}) {
  return (
    <section className="bg-ivory py-24 sm:py-28">
      <div className="container-site text-center">
        <Reveal>
          <p className="eyebrow">Social</p>
          <h2 className="heading-2 mt-4">{social.heading}</h2>
          {social.intro ? (
            <p className="lead mx-auto mt-4 max-w-xl">{social.intro}</p>
          ) : null}
          {social.handle ? (
            <p className="mt-5 text-sm font-bold tracking-[0.2em] text-bronze uppercase">
              {social.handle}
            </p>
          ) : null}
          <div className="mt-7 flex justify-center gap-3">
            {settings.socials.map((s) => (
              <SocialIconLink
                key={s.platform + s.url}
                platform={s.platform}
                url={s.url}
                className="border-charcoal/15 text-charcoal/70 hover:border-gold hover:bg-gold hover:text-charcoal"
              />
            ))}
          </div>
        </Reveal>

        {social.images.length ? (
          <RevealGroup className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {social.images.slice(0, 8).map((src, i) => (
              <RevealItem key={`${src}-${i}`} className="media-zoom relative aspect-square overflow-hidden bg-stone-dark">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width:640px) 25vw, 50vw"
                  className="object-cover"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : null}
      </div>
    </section>
  );
}
