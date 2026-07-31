"use client";

/** Upcoming/past event filtering over the static event list. */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EventCard } from "@/components/sections/EventCard";
import { cn } from "@/lib/utils";
import type { CentreEvent } from "@/types/content";

type Filter = "upcoming" | "past" | "all";

export function EventsExplorer({
  upcoming,
  past,
}: {
  upcoming: CentreEvent[];
  past: CentreEvent[];
}) {
  const [filter, setFilter] = useState<Filter>("upcoming");

  const visible = useMemo(() => {
    if (filter === "upcoming") return upcoming.map((e) => ({ event: e, past: false }));
    if (filter === "past") return past.map((e) => ({ event: e, past: true }));
    return [
      ...upcoming.map((e) => ({ event: e, past: false })),
      ...past.map((e) => ({ event: e, past: true })),
    ];
  }, [filter, upcoming, past]);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past", label: "Past events", count: past.length },
    { key: "all", label: "All", count: upcoming.length + past.length },
  ];

  return (
    <div className="container-site py-14 sm:py-16">
      <div
        role="group"
        aria-label="Filter events"
        className="mb-10 flex flex-wrap gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all focus-gold",
              filter === tab.key
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-charcoal/20 text-charcoal/70 hover:border-charcoal/50 hover:text-charcoal",
            )}
          >
            {tab.label}
            <span className={cn("ml-1.5", filter === tab.key ? "text-gold" : "text-muted-foreground")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="border border-dashed border-charcoal/20 px-6 py-20 text-center">
          <p className="text-lg font-bold text-charcoal">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            New events are added regularly — check back soon.
          </p>
        </div>
      ) : (
        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map(({ event, past: isPast }) => (
              <motion.li
                key={event.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <EventCard event={event} past={isPast} className="h-full" />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
