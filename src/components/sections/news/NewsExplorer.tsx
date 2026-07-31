"use client";

/** Category filtering over the news grid — featured story stays on top. */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NewsCard } from "@/components/sections/NewsCard";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/content";

export function NewsExplorer({ articles }: { articles: NewsArticle[] }) {
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(articles.map((a) => a.category).filter(Boolean))],
    [articles],
  );

  const filtered = useMemo(
    () => (category ? articles.filter((a) => a.category === category) : articles),
    [articles, category],
  );

  const [featured, ...rest] = filtered;

  return (
    <div className="container-site py-14 sm:py-16">
      {categories.length > 1 ? (
        <div role="group" aria-label="Filter news" className="mb-10 flex flex-wrap gap-2">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            All stories
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
              {c}
            </Chip>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="border border-dashed border-charcoal/20 px-6 py-20 text-center">
          <p className="text-lg font-bold text-charcoal">No stories yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={category ?? "all"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {featured ? <NewsCard article={featured} featured /> : null}
            {rest.length ? (
              <div className="mt-14 grid gap-10 border-t border-charcoal/10 pt-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <NewsCard key={article.slug} article={article} />
                ))}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function Chip({
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
          ? "border-charcoal bg-charcoal text-ivory"
          : "border-charcoal/20 text-charcoal/70 hover:border-charcoal/50 hover:text-charcoal",
      )}
    >
      {children}
    </button>
  );
}
