"use client";

/**
 * The store directory: instant search, category chips, an A–Z rail and a
 * live open-now indicator — all client-side over the statically delivered
 * store list, so filtering is immediate.
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
      <PageHeader content={header} className="pb-10 sm:pb-12">
        <div className="mt-10 space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ivory/40"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category…"
              aria-label="Search stores"
              className="h-12 w-full border border-ivory/20 bg-ivory/5 pr-4 pl-11 text-sm text-ivory placeholder:text-ivory/40 backdrop-blur-sm transition-colors outline-none focus:border-gold"
            />
          </div>
          <OpenNowBadge hours={hours} tone="dark" />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            All stores
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
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
                  "size-8 shrink-0 rounded-full text-[11px] font-bold transition-colors focus-gold",
                  letter === l
                    ? "bg-gold text-charcoal"
                    : enabled
                      ? "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
                      : "text-ivory/20",
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
      <div className="bg-ivory">
        <div className="container-site py-14 sm:py-16">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "store" : "stores"}
              {category ? ` in ${category}` : ""}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-bronze uppercase hover:text-charcoal focus-gold"
              >
                <X className="size-3.5" aria-hidden /> Clear filters
              </button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="border border-dashed border-charcoal/20 px-6 py-20 text-center">
              <p className="text-lg font-bold text-charcoal">No stores found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search or clear the filters.
              </p>
            </div>
          ) : (
            <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((store) => (
                  <motion.li
                    key={store.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
        "rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all focus-gold",
        active
          ? "border-gold bg-gold text-charcoal"
          : "border-ivory/25 text-ivory/75 hover:border-ivory/60 hover:text-ivory",
      )}
    >
      {children}
    </button>
  );
}
