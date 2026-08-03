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
    <div className="container-site pb-16">
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
              "focus-brand rounded-full px-4 py-2 text-xs leading-none font-bold transition-colors",
              filter === tab.key
                ? "bg-yellow text-ink"
                : "bg-cream text-ink hover:bg-sand",
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-ink-soft">{tab.count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl bg-cream px-6 py-20 text-center">
          <p className="heading-m text-ink">Nothing here yet</p>
          <p className="text-body mt-2 text-ink-soft">
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
