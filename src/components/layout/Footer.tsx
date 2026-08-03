import Link from "next/link";
import { navigation, settings } from "@/lib/content";
import { SocialIconLink } from "@/components/ui/social-icon";
import { NewsletterForm } from "./NewsletterForm";

/**
 * Footer (reference pattern): white, quiet grey text, address + full hours
 * with a "see all" link, contact blurb, link columns, grey social icons and
 * a legal row. Bottom padding clears the fixed controls on small screens.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-sand bg-white pb-28 text-ink md:pb-6">
      <div className="container-site pt-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand + address */}
          <div>
            <p className="font-title text-xl leading-none font-extrabold">
              Guildbourne
            </p>
            <p className="font-title mt-0.5 text-xs font-semibold text-ink-soft">
              Centre · Worthing
            </p>
            <address className="text-body mt-5 text-ink-soft not-italic">
              {settings.contact.addressLine1}
              <br />
              {settings.contact.addressLine2}
              <br />
              {settings.contact.postcode}
            </address>
          </div>

          {/* Hours */}
          <div>
            <h2 className="heading-xs text-ink">Opening hours</h2>
            <dl className="text-body mt-4 space-y-1.5">
              {settings.hoursDisplay.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{row.label}</dt>
                  <dd className="font-bold">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/contact"
              className="focus-brand mt-3 inline-block rounded-sm text-sm font-bold text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              See all opening hours
            </Link>
          </div>

          {/* Links */}
          <nav aria-label="Footer">
            <h2 className="heading-xs text-ink">Explore</h2>
            <ul className="text-body mt-4 space-y-2">
              {[
                ...navigation.header,
                ...navigation.footerColumns.flatMap((c) => c.links),
              ]
                .filter(
                  (link, i, all) =>
                    all.findIndex((l) => l.href === link.href) === i,
                )
                .slice(0, 8)
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-brand rounded-sm text-ink-soft hover:text-ink hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Contact + newsletter */}
          <div>
            <h2 className="heading-xs text-ink">We&rsquo;d love to hear from you</h2>
            <ul className="text-body mt-4 space-y-1.5 text-ink-soft">
              <li>
                <a
                  href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                  className="focus-brand rounded-sm hover:text-ink hover:underline"
                >
                  {settings.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="focus-brand rounded-sm break-all hover:text-ink hover:underline"
                >
                  {settings.contact.email}
                </a>
              </li>
            </ul>
            <NewsletterForm className="mt-5" />
          </div>
        </div>

        {/* Socials + legal */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-sand pt-6 sm:flex-row sm:items-center">
          <div className="flex gap-2.5">
            {settings.socials.map((s) => (
              <SocialIconLink
                key={s.platform + s.url}
                platform={s.platform}
                url={s.url}
                className="border-sand text-ink-soft hover:border-yellow hover:bg-yellow hover:text-ink"
              />
            ))}
          </div>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
            {navigation.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-brand rounded-sm hover:text-ink hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              © {year} {settings.siteName}
              {settings.operator ? ` · ${settings.operator}` : ""}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
