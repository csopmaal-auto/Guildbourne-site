import Link from "next/link";
import { navigation, settings } from "@/lib/content";
import { SocialIconLink } from "@/components/ui/social-icon";
import { NewsletterForm } from "./NewsletterForm";

/** The premium footer: brand + newsletter, link columns, hours, legal row. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal bg-grain text-ivory">
      <div className="container-site">
        {/* Upper: brand + newsletter */}
        <div className="flex flex-col gap-10 border-b border-ivory/10 py-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <p className="text-2xl font-extrabold tracking-[0.2em]">GUILDBOURNE</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.42em] text-gold uppercase">
              Centre · Worthing
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ivory/60">
              {settings.tagline}. {settings.contact.addressLine1},{" "}
              {settings.contact.addressLine2}, {settings.contact.postcode}.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">
              Newsletter
            </p>
            <NewsletterForm tone="dark" className="mt-3" />
          </div>
        </div>

        {/* Middle: link columns + hours + contact */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {navigation.footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-ivory/70 transition-colors hover:text-ivory focus-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">
              Opening hours
            </p>
            <dl className="mt-4 space-y-2.5 text-sm">
              {settings.hoursDisplay.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-ivory/70">{row.label}</dt>
                  <dd className="text-right text-ivory/90">{row.value}</dd>
                </div>
              ))}
            </dl>
            {settings.hoursNote ? (
              <p className="mt-3 text-xs leading-relaxed text-ivory/45">
                {settings.hoursNote}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.28em] text-gold uppercase">
              Get in touch
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
              <li>
                <a
                  href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                  className="link-underline transition-colors hover:text-ivory focus-gold"
                >
                  {settings.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="link-underline break-all transition-colors hover:text-ivory focus-gold"
                >
                  {settings.contact.email}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-2.5">
              {settings.socials.map((s) => (
                <SocialIconLink
                  key={s.platform + s.url}
                  platform={s.platform}
                  url={s.url}
                  className="border-ivory/20 text-ivory/80 hover:border-gold hover:text-gold"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legal row */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-ivory/10 py-6 text-xs text-ivory/45 sm:flex-row sm:items-center">
          <p>
            © {year} {settings.siteName}
            {settings.operator ? ` · ${settings.operator}` : ""}. All rights
            reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {navigation.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-underline transition-colors hover:text-ivory/80 focus-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
