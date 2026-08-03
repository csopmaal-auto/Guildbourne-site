"use client";

/**
 * The main menu (reference pattern): a white sheet that slides up from the
 * bottom on mobile (rounded top corners) and drops from the top on desktop,
 * with a floating round close button. Contents: hours pill, big display-font
 * link list, a pair of mosaic tiles (desktop), socials and legal links.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SocialIconLink } from "@/components/ui/social-icon";
import { Tile } from "@/components/sections/home/Tile";
import type { HomeTile, Navigation, Settings } from "@/types/content";
import { HoursPill } from "./HoursPill";

export function MenuSheet({
  open,
  onClose,
  navigation,
  settings,
  tiles,
  onNewsletter,
}: {
  open: boolean;
  onClose: () => void;
  navigation: Navigation;
  settings: Settings;
  tiles: HomeTile[];
  onNewsletter: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Scroll lock + Esc + initial focus.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Merge header links with footer columns, de-duplicated by href.
  const links: { label: string; href: string }[] = [];
  const seen = new Set<string>();
  for (const link of [
    ...navigation.header,
    ...navigation.footerColumns.flatMap((c) => c.links),
  ]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    links.push(link);
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[65] bg-backdrop"
          />
          <motion.div
            key="sheet"
            id="main-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            data-lenis-prevent
            initial={{ y: "8%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "6%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[88dvh] overflow-y-auto rounded-t-xxl bg-white shadow-2xl lg:top-0 lg:bottom-auto lg:max-h-[92dvh] lg:rounded-t-none lg:rounded-b-[2rem]"
          >
            <div className="container-site py-8 lg:py-10">
              {/* Top row: wordmark + hours pill */}
              <div className="flex flex-wrap items-start justify-between gap-6 pr-16">
                <Link href="/" onClick={onClose} className="focus-brand rounded-md">
                  <span className="font-title block text-2xl leading-none font-extrabold text-ink">
                    Guildbourne
                  </span>
                  <span className="font-title mt-0.5 block text-xs font-semibold text-ink-soft">
                    Centre · Worthing
                  </span>
                </Link>
                <div className="hidden w-64 sm:block">
                  <HoursPill siteName={settings.siteName} hours={settings.hours} />
                </div>
              </div>

              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                {/* Link list */}
                <nav aria-label="Main menu">
                  <ul>
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="heading-m focus-brand mb-3 block rounded-sm text-ink transition-colors hover:text-ink-soft hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={onNewsletter}
                        className="heading-m focus-brand mb-3 block rounded-sm text-ink transition-colors hover:text-ink-soft hover:underline"
                      >
                        Newsletter
                      </button>
                    </li>
                  </ul>
                </nav>

                {/* Tiles (desktop) */}
                {tiles.length ? (
                  <div className="hidden gap-5 lg:grid lg:grid-cols-2 lg:content-start">
                    {tiles.slice(0, 2).map((tile) => (
                      <Tile key={tile.href + tile.title} tile={tile} />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Socials + legal */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-sand pt-6">
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
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {navigation.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="focus-brand rounded-sm text-xs text-ink-soft hover:text-ink hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Floating close button */}
          <motion.button
            key="close"
            ref={closeRef}
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            className="focus-brand fixed top-4 right-5 z-[75] grid size-12 place-items-center rounded-full bg-sand text-ink transition-colors hover:bg-cream sm:right-7 lg:right-10"
          >
            <X className="size-5" aria-hidden />
          </motion.button>
        </>
      ) : null}
    </AnimatePresence>
  );
}
