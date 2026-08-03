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
import { FacilityCard } from "@/components/sections/FacilityCard";
import { contact, facilities, settings } from "@/lib/content";
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
        <Reveal delay={0.1} className="mt-6 flex flex-wrap items-center gap-2">
          <OpenNowBadge hours={settings.hours} className="bg-cream" />
          <a
            href={phoneHref}
            className="focus-brand inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs leading-none font-bold text-ink transition-colors hover:bg-sand"
          >
            <Phone className="size-3.5" aria-hidden /> {settings.contact.phone}
          </a>
          <a
            href={`mailto:${settings.contact.email}`}
            className="focus-brand inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs leading-none font-bold text-ink transition-colors hover:bg-sand"
          >
            <Mail className="size-3.5" aria-hidden /> {settings.contact.email}
          </a>
        </Reveal>
      </PageHeader>

      {/* Form + details */}
      <section className="bg-white pb-14">
        <div className="container-site grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="rounded-xxl bg-cream p-6 sm:p-8">
              <h2 className="heading-l text-ink">{contact.form.heading}</h2>
              {contact.form.intro ? (
                <p className="text-body mt-2 text-ink-soft">{contact.form.intro}</p>
              ) : null}
              <div className="relative mt-6">
                <ContactForm form={contact.form} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <aside className="space-y-7 rounded-xxl bg-cream p-6 sm:p-8">
              <div>
                <h2 className="heading-xs text-ink uppercase">Visit us</h2>
                <address className="text-body mt-2.5 text-ink-soft not-italic">
                  {settings.contact.addressLine1}
                  <br />
                  {settings.contact.addressLine2}
                  <br />
                  {settings.contact.postcode}
                </address>
              </div>
              <div>
                <h2 className="heading-xs text-ink uppercase">Opening hours</h2>
                <dl className="text-body mt-2.5 space-y-1.5">
                  {settings.hoursDisplay.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <dt className="text-ink-soft">{row.label}</dt>
                      <dd className="font-bold text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {settings.hoursNote ? (
                  <p className="mt-2.5 text-xs text-ink-soft">{settings.hoursNote}</p>
                ) : null}
              </div>
              <div>
                <h2 className="heading-xs text-ink uppercase">Post</h2>
                <p className="text-body mt-2.5 text-ink-soft">
                  {settings.contact.postalAddress}
                </p>
              </div>
              <div className="border-t border-sand pt-5">
                <h2 className="heading-xs text-ink uppercase">Follow the centre</h2>
                <div className="mt-3 flex gap-2.5">
                  {settings.socials.map((s) => (
                    <SocialIconLink
                      key={s.platform + s.url}
                      platform={s.platform}
                      url={s.url}
                      className="border-sand bg-white text-ink-soft hover:border-yellow hover:bg-yellow hover:text-ink"
                    />
                  ))}
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Getting here + map */}
      <section id="getting-here" className="scroll-mt-10 bg-cream py-12 sm:py-16">
        <div className="container-site">
          <Reveal className="mb-8">
            <h2 className="heading-l text-ink">How to get to us</h2>
            <p className="text-body mt-2 text-ink-soft">
              By bus, train, car, bike or foot.
            </p>
          </Reveal>
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contact.gettingHere.map((item) => {
              const Icon = MODE_ICONS[item.mode] ?? Footprints;
              return (
                <RevealItem key={item.mode}>
                  <div className="h-full rounded-xl bg-white p-6 transition-colors duration-200 hover:bg-sand">
                    <span className="grid size-11 place-items-center rounded-full bg-yellow text-ink">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="heading-m mt-4 text-ink">{item.title}</h3>
                    <p className="text-body mt-1.5 text-ink-soft">{item.body}</p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
          <Reveal className="mt-8">
            <MapEmbed
              query={contact.map.query}
              mapLink={settings.contact.mapLink}
              linkLabel={contact.map.linkLabel}
            />
          </Reveal>
        </div>
      </section>

      {/* Floorplan */}
      <section id="floorplan" className="scroll-mt-10 bg-white py-12 sm:py-16">
        <div className="container-site">
          <Reveal className="mb-8 max-w-2xl">
            <h2 className="heading-l text-ink">{contact.floorplan.heading}</h2>
            {contact.floorplan.body ? (
              <p className="text-body mt-2 text-ink-soft">{contact.floorplan.body}</p>
            ) : null}
          </Reveal>
          {contact.floorplan.image ? (
            <Reveal>
              <figure className="rounded-xxl bg-cream p-4 sm:p-8">
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
                  <figcaption className="mt-4 text-center text-xs font-bold text-ink-soft">
                    {contact.floorplan.caption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Facilities */}
      {facilities.length ? (
        <section id="facilities" className="scroll-mt-10 bg-cream py-12 sm:py-16">
          <div className="container-site">
            <Reveal className="mb-8">
              <h2 className="heading-l text-ink">Good to know</h2>
              <p className="text-body mt-2 text-ink-soft">
                The practical details, taken care of.
              </p>
            </Reveal>
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility) => (
                <RevealItem key={facility.slug}>
                  <FacilityCard facility={facility} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      {/* FAQs */}
      {contact.faqs.length ? (
        <section id="faqs" className="scroll-mt-10 bg-white py-12 sm:py-16">
          <div className="container-narrow">
            <Reveal className="mb-6 text-center">
              <h2 className="heading-l text-ink">Frequently asked</h2>
            </Reveal>
            <Reveal>
              <Accordion type="single" collapsible>
                {contact.faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="mb-3 rounded-xl border-0 bg-cream px-5"
                  >
                    <AccordionTrigger className="font-title py-4 text-left text-base font-bold text-ink hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-body pb-5 text-ink-soft">
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
      <section id="lettings" className="scroll-mt-10 bg-white pb-16">
        <div className="container-site">
          <Reveal>
            <div className="tile-pattern flex flex-col items-start justify-between gap-8 rounded-xxl bg-tile-green p-8 text-tile-green-text sm:p-10 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="heading-l">{contact.letting.heading}</h2>
                <p className="text-body mt-3">{contact.letting.body}</p>
              </div>
              <div className="shrink-0 rounded-xl bg-white/85 p-6 text-ink">
                <p className="text-xs font-bold text-ink-soft uppercase">
                  Letting agents
                </p>
                <p className="heading-m mt-1">{contact.letting.agent}</p>
                <a
                  href={`tel:${contact.letting.phone.replace(/\s/g, "")}`}
                  className="focus-brand mt-1 inline-block rounded-sm text-lg font-extrabold text-ink underline decoration-yellow decoration-4 underline-offset-4 hover:text-ink-soft"
                >
                  {contact.letting.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
