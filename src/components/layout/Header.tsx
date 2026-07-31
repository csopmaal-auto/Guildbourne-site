"use client";

/**
 * Fixed site header: announcement bar + navigation. Transparent over the
 * page hero, gaining a charcoal blur once scrolled. Includes the search
 * overlay trigger and the fullscreen mobile menu.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialIconLink } from "@/components/ui/social-icon";
import { cn } from "@/lib/utils";
import type { Navigation, Settings } from "@/types/content";
import { SearchOverlay, type SearchItem } from "./SearchOverlay";

export function Header({
  navigation,
  settings,
  searchIndex,
}: {
  navigation: Navigation;
  settings: Settings;
  searchIndex: SearchItem[];
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Cmd/Ctrl+K opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { announcement } = settings;

  return (
    <>
      <a
        href="#content"
        className="sr-only z-[60] rounded bg-gold px-4 py-2 font-semibold text-charcoal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled || menuOpen
            ? "bg-charcoal/90 shadow-[0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        {/* Announcement bar — collapses away once scrolled */}
        {announcement.enabled && announcement.text ? (
          <div
            className={cn(
              "overflow-hidden bg-charcoal text-center transition-[max-height,opacity] duration-500",
              scrolled && !menuOpen ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
            )}
          >
            <p className="container-site flex items-center justify-center gap-3 py-2 text-[11px] font-medium tracking-[0.14em] text-ivory/80 uppercase">
              <span className="hidden size-1 rounded-full bg-gold sm:block" aria-hidden />
              {announcement.text}
              {announcement.link && announcement.linkLabel ? (
                <Link
                  href={announcement.link}
                  className="link-underline hidden font-semibold text-gold sm:inline"
                >
                  {announcement.linkLabel}
                </Link>
              ) : null}
            </p>
          </div>
        ) : null}

        {/* Main nav row */}
        <div className="container-site flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]">
          <Link
            href="/"
            className="group shrink-0 rounded-sm focus-gold"
            aria-label={`${settings.siteName} — home`}
          >
            <span className="block text-base leading-none font-extrabold tracking-[0.22em] text-ivory sm:text-lg">
              GUILDBOURNE
            </span>
            <span className="mt-1 block text-[9px] leading-none font-semibold tracking-[0.42em] text-gold">
              CENTRE · WORTHING
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navigation.header.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-active={active}
                      className="link-underline pb-1 text-[12.5px] font-semibold tracking-[0.18em] text-ivory/85 uppercase transition-colors hover:text-ivory data-[active=true]:text-gold focus-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the site"
              className="inline-flex size-10 items-center justify-center rounded-full text-ivory/85 transition-colors hover:bg-ivory/10 hover:text-ivory focus-gold"
            >
              <Search className="size-[18px]" aria-hidden />
            </button>
            <Button
              asChild
              variant="outline-light"
              size="xl"
              className="hidden h-10 px-5 lg:inline-flex"
            >
              <Link href="/contact">Plan a visit</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="inline-flex size-10 items-center justify-center rounded-full text-ivory transition-colors hover:bg-ivory/10 lg:hidden focus-gold"
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-charcoal bg-grain pt-28 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
          >
            <nav aria-label="Mobile" className="container-site flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {navigation.header.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    }}
                    exit={{ opacity: 0 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-baseline justify-between border-b border-ivory/10 py-4 focus-gold"
                    >
                      <span className="text-3xl font-extrabold tracking-tight text-ivory transition-colors group-hover:text-gold">
                        {link.label}
                      </span>
                      <ArrowUpRight className="size-5 text-ivory/40 transition-colors group-hover:text-gold" aria-hidden />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.35 } }}
              exit={{ opacity: 0 }}
              className="container-site border-t border-ivory/10 py-6"
            >
              <p className="text-xs tracking-wide text-ivory/60">
                {settings.hoursDisplay[0]
                  ? `${settings.hoursDisplay[0].label} · ${settings.hoursDisplay[0].value}`
                  : settings.tagline}
              </p>
              <div className="mt-4 flex gap-2.5">
                {settings.socials.map((s) => (
                  <SocialIconLink
                    key={s.platform + s.url}
                    platform={s.platform}
                    url={s.url}
                    className="border-ivory/20 text-ivory/80 hover:border-gold hover:text-gold"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} index={searchIndex} />
    </>
  );
}
