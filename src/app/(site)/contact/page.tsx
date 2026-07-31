import type { Metadata } from "next";
import Image from "next/image";
import {
  BusFront,
  Car,
  Footprints,
  Mail,
  Phone,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OpenNowBadge } from "@/components/ui/open-now";
import { SocialIconLink } from "@/components/ui/social-icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { MapEmbed } from "@/components/sections/contact/MapEmbed";
import { contact, settings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/contact");
export const dynamic = "force-static";

const MODE_ICONS: Record<string, LucideIcon> = {
  walk: Footprints,
  car: Car,
  bus: BusFront,
  train: TrainFront,
};

export default function ContactPage() {
  const phoneHref = `tel:${settings.contact.phone.replace(/\s/g, "")}`;

  return (
    <>
      <PageHeader content={contact.header}>
        <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center gap-3">
          <OpenNowBadge hours={settings.hours} tone="dark" />
          <a
            href={phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-4 py-1.5 text-sm text-ivory/85 transition-colors hover:border-gold hover:text-gold focus-gold"
          >
            <Phone className="size-3.5" aria-hidden /> {settings.contact.phone}
          </a>
          <a
            href={`mailto:${settings.contact.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-4 py-1.5 text-sm text-ivory/85 transition-colors hover:border-gold hover:text-gold focus-gold"
          >
            <Mail className="size-3.5" aria-hidden /> {settings.contact.email}
          </a>
        </Reveal>
      </PageHeader>

      {/* Form + details */}
      <section className="bg-ivory py-16 sm:py-20">
        <div className="container-site grid gap-14 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow">{contact.form.heading}</p>
            <h2 className="heading-2 mt-3">Send us a message</h2>
            {contact.form.intro ? (
              <p className="lead mt-3">{contact.form.intro}</p>
            ) : null}
            <div className="relative mt-8">
              <ContactForm form={contact.form} />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <aside className="space-y-8 border border-charcoal/10 bg-white p-7">
              <div>
                <p className="eyebrow text-[10px]">Visit us</p>
                <address className="mt-2.5 text-sm leading-relaxed text-charcoal/80 not-italic">
                  {settings.contact.addressLine1}
                  <br />
                  {settings.contact.addressLine2}
                  <br />
                  {settings.contact.postcode}
                </address>
              </div>
              <div>
                <p className="eyebrow text-[10px]">Opening hours</p>
                <dl className="mt-2.5 space-y-1.5 text-sm">
                  {settings.hoursDisplay.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="font-semibold text-charcoal">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {settings.hoursNote ? (
                  <p className="mt-2.5 text-xs text-muted-foreground">
                    {settings.hoursNote}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="eyebrow text-[10px]">Post</p>
                <p className="mt-2.5 text-sm leading-relaxed text-charcoal/80">
                  {settings.contact.postalAddress}
                </p>
              </div>
              <div className="border-t border-charcoal/10 pt-6">
                <p className="eyebrow text-[10px]">Follow the centre</p>
                <div className="mt-3 flex gap-2.5">
                  {settings.socials.map((s) => (
                    <SocialIconLink
                      key={s.platform + s.url}
                      platform={s.platform}
                      url={s.url}
                      className="border-charcoal/15 text-charcoal/70 hover:border-gold hover:bg-gold hover:text-charcoal"
                    />
                  ))}
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Getting here + map */}
      <section id="getting-here" className="scroll-mt-24 bg-stone py-16 sm:py-20">
        <div className="container-site">
          <Reveal className="mb-10">
            <p className="eyebrow">Getting here</p>
            <h2 className="heading-2 mt-3">Easy to reach, however you travel</h2>
          </Reveal>
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contact.gettingHere.map((item) => {
              const Icon = MODE_ICONS[item.mode] ?? Footprints;
              return (
                <RevealItem key={item.mode}>
                  <div className="h-full border border-charcoal/8 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_18px_40px_-18px_rgba(28,27,24,0.25)]">
                    <span className="inline-flex size-11 items-center justify-center rounded-full bg-stone text-bronze">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-bold text-charcoal">{item.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
          <Reveal className="mt-10">
            <MapEmbed
              query={contact.map.query}
              mapLink={settings.contact.mapLink}
              linkLabel={contact.map.linkLabel}
            />
          </Reveal>
        </div>
      </section>

      {/* Floorplan */}
      <section id="floorplan" className="scroll-mt-24 bg-ivory py-16 sm:py-20">
        <div className="container-site">
          <Reveal className="mb-10 max-w-2xl">
            <p className="eyebrow">Centre plan</p>
            <h2 className="heading-2 mt-3">{contact.floorplan.heading}</h2>
            {contact.floorplan.body ? (
              <p className="lead mt-3">{contact.floorplan.body}</p>
            ) : null}
          </Reveal>
          {contact.floorplan.image ? (
            <Reveal>
              <figure className="border border-charcoal/10 bg-white p-4 sm:p-8">
                {contact.floorplan.image.endsWith(".svg") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contact.floorplan.image}
                    alt={contact.floorplan.caption || "Centre floorplan"}
                    className="mx-auto h-auto w-full max-w-4xl"
                  />
                ) : (
                  <Image
                    src={contact.floorplan.image}
                    alt={contact.floorplan.caption || "Centre floorplan"}
                    width={1600}
                    height={1000}
                    className="mx-auto h-auto w-full max-w-4xl"
                  />
                )}
                {contact.floorplan.caption ? (
                  <figcaption className="mt-4 text-center text-xs tracking-wide text-muted-foreground uppercase">
                    {contact.floorplan.caption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* FAQs */}
      {contact.faqs.length ? (
        <section id="faqs" className="scroll-mt-24 bg-stone py-16 sm:py-20">
          <div className="container-narrow">
            <Reveal className="mb-8 text-center">
              <p className="eyebrow">Good to know</p>
              <h2 className="heading-2 mt-3">Frequently asked</h2>
            </Reveal>
            <Reveal>
              <Accordion type="single" collapsible className="border-t border-charcoal/10">
                {contact.faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-charcoal/10"
                  >
                    <AccordionTrigger className="py-5 text-left text-[15px] font-bold text-charcoal hover:text-bronze hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Lettings */}
      <section id="lettings" className="scroll-mt-24 bg-charcoal bg-grain py-16 text-ivory sm:py-20">
        <div className="container-site">
          <Reveal className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="eyebrow-light">Join the centre</p>
              <h2 className="heading-2 mt-3">{contact.letting.heading}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ivory/70">
                {contact.letting.body}
              </p>
            </div>
            <div className="shrink-0 border border-gold/40 p-7">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">
                Letting agents
              </p>
              <p className="mt-2 text-lg font-bold">{contact.letting.agent}</p>
              <a
                href={`tel:${contact.letting.phone.replace(/\s/g, "")}`}
                className="link-underline mt-1 inline-block text-xl font-extrabold text-gold focus-gold"
              >
                {contact.letting.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
