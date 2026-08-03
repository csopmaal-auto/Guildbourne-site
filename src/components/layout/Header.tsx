"use client";

/**
 * Site chrome (reference pattern): an absolute header with the wordmark
 * top-left and the opening-hours pill top-right, plus two FIXED round
 * controls on the right edge — the yellow menu button (3 bars) and the
 * search button below it. The menu opens as a sheet; the newsletter lives
 * in a right-hand slide-over.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeTile, Navigation, Settings } from "@/types/content";
import { HoursPill } from "./HoursPill";
import { MenuSheet } from "./MenuSheet";
import { NewsletterPanel } from "./NewsletterPanel";
import { SearchOverlay, type SearchItem } from "./SearchOverlay";

export function Header({
  navigation,
  settings,
  searchIndex,
  menuTiles,
  newsletter,
}: {
  navigation: Navigation;
  settings: Settings;
  searchIndex: SearchItem[];
  menuTiles: HomeTile[];
  newsletter: { heading: string; body: string; disclaimer: string };
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  // Close overlays on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setNewsletterOpen(false);
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

  return (
    <>
      <a
        href="#content"
        className="sr-only z-[80] rounded-full bg-yellow px-5 py-2.5 font-bold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Absolute header row */}
      <header className="absolute top-0 right-5 left-5 z-30 sm:right-7 sm:left-7 lg:right-28 lg:left-10">
        <div className="lg:mt-6">
          <div className="grid w-full grid-cols-11 items-start gap-5 pt-6 lg:pt-0">
            <div className="col-span-7 w-fit sm:col-span-5 lg:pt-3">
              <Link
                href="/"
                aria-label={`${settings.siteName} — home`}
                className={cn(
                  "focus-brand block w-fit",
                  isHome
                    ? "rounded-[20px] bg-white/95 px-4 py-2.5 shadow-sm lg:ml-12"
                    : "rounded-md lg:ml-2",
                )}
              >
                <span className="font-title block text-[1.5rem] leading-none font-extrabold tracking-tight text-ink">
                  Guildbourne
                </span>
                <span className="font-title mt-0.5 block text-[0.75rem] leading-none font-semibold text-ink-soft">
                  Centre · Worthing
                </span>
              </Link>
            </div>
            <div className="col-span-4 hidden justify-end sm:col-span-6 lg:flex">
              <div style={{ width: "calc(50% - 0.625rem)" }}>
                <HoursPill siteName={settings.siteName} hours={settings.hours} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed round controls */}
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="main-menu"
        aria-label="Open main menu"
        onClick={() => setMenuOpen(true)}
        className="focus-brand fixed top-6 right-5 z-[60] grid size-[3.75rem] transform-gpu place-items-center content-center rounded-full bg-yellow transition-all duration-200 hover:bg-yellow-dark sm:right-7 lg:right-10"
      >
        <span className="m-px h-1 w-5 rounded-sm bg-ink" />
        <span className="m-px h-1 w-5 rounded-sm bg-ink" />
        <span className="m-px h-1 w-5 rounded-sm bg-ink" />
      </button>
      <button
        type="button"
        aria-label="Search the site"
        onClick={() => setSearchOpen(true)}
        className="focus-brand fixed top-[6.5rem] right-5 z-[55] grid size-12 place-items-center rounded-full bg-sand text-ink-soft transition-all duration-200 hover:bg-cream hover:text-ink sm:right-7 lg:right-11"
      >
        <Search className="size-5" aria-hidden />
      </button>

      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigation={navigation}
        settings={settings}
        tiles={menuTiles}
        onNewsletter={() => {
          setMenuOpen(false);
          setNewsletterOpen(true);
        }}
      />
      <NewsletterPanel
        open={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        newsletter={newsletter}
      />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} index={searchIndex} />
    </>
  );
}
