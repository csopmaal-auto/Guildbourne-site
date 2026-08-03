"use client";

/**
 * The store directory: instant search, category chips, an A–Z rail and a
 * live open-now indicator — all client-side over the statically delivered
 * store list, so filtering is immediate. Styled in the tile language:
 * cream pills, yellow active states.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OpenNowBadge } from "@/components/ui/open-now";
import { StoreCard } from "@/components/sections/StoreCard";
import { cn } from "@/lib/utils";
import type { PageHeader as PageHeaderContent, Store, WeekHours } from "@/types/content";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function DirectoryExplorer({
  header,
  stores,
  categories,
  hours,
}: {
  header: PageHeaderContent;
  stores: Store[];
  categories: string[];
  hours: WeekHours;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);

  // Restore filters from the URL (shareable links) after mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const c = params.get("category");
    if (q) setQuery(q);
    if (c && categories.includes(c)) setCategory(c);
  }, [categories]);

  // Keep the URL in sync without triggering navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, category]);

  const activeLetters = useMemo(
    () => new Set(stores.map((s) => s.name[0]?.toUpperCase())),
    [stores],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter((store) => {
      if (category && store.category !== category) return false;
      if (letter && store.name[0]?.toUpperCase() !== letter) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.excerpt.toLowerCase().includes(q)
      );
    });
  }, [stores, query, category, letter]);

  const clearAll = () => {
    setQuery("");
    setCategory(null);
    setLetter(null);
  };
  const hasFilters = Boolean(query || category || letter);

  return (
    <div>
      <PageHeader content={header} className="pb-6">
        <div className="mt-8 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute top-1/2 left-5 size-4 -translate-y-1/2 text-ink-soft"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or category…"
                aria-label="Search stores"
                className="h-12 w-full rounded-full bg-cream pr-5 pl-12 text-sm text-ink transition-colors outline-none placeholder:text-ink-soft focus:bg-sand"
              />
            </div>
            <OpenNowBadge hours={hours} className="bg-cream" />
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <FilterChip active={category === null} onClick={() => setCategory(null)}>
              All stores
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => setCategory(category === c ? null : c)}
              >
                {c}
              </FilterChip>
            ))}
          </div>

          <div
            className="scrollbar-none -mx-1 flex gap-0.5 overflow-x-auto px-1 pt-1"
            role="group"
            aria-label="Filter by first letter"
          >
            {ALPHABET.map((l) => {
              const enabled = activeLetters.has(l);
              return (
                <button
                  key={l}
                  type="button"
                  disabled={!enabled}
                  aria-pressed={letter === l}
                  onClick={() => setLetter(letter === l ? null : l)}
                  className={cn(
                    "focus-brand size-8 shrink-0 rounded-full text-xs font-bold transition-colors",
                    letter === l
                      ? "bg-yellow text-ink"
                      : enabled
                        ? "text-ink hover:bg-cream"
                        : "text-ink/20",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </PageHeader>

      {/* Results */}
      <div className="bg-white">
        <div className="container-site pb-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-ink-soft" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "store" : "stores"}
              {category ? ` in ${category}` : ""}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="focus-brand inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-sand"
              >
                <X className="size-3.5" aria-hidden /> Clear filters
              </button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl bg-cream px-6 py-20 text-center">
              <p className="heading-m text-ink">No stores found</p>
              <p className="text-body mt-2 text-ink-soft">
                Try a different search or clear the filters.
              </p>
            </div>
          ) : (
            <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((store) => (
                  <motion.li
                    key={store.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <StoreCard store={store} className="h-full" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "focus-brand rounded-full px-4 py-2 text-xs leading-none font-bold transition-colors",
        active ? "bg-yellow text-ink" : "bg-cream text-ink hover:bg-sand",
      )}
    >
      {children}
    </button>
  );
}
