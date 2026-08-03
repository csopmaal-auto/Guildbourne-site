"use client";

/**
 * Live open/closed indicator computed from centre hours (Europe/London).
 * Rendered client-side only so statically generated pages never show a
 * stale state.
 */
import { useEffect, useState } from "react";
import { getOpenState, type OpenState } from "@/lib/hours";
import { cn } from "@/lib/utils";
import type { WeekHours } from "@/types/content";

export function OpenNowBadge({
  hours,
  className,
}: {
  hours: WeekHours;
  /** Kept for call-site compatibility; the pill styles itself for any surface. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    const update = () => setState(getOpenState(hours));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [hours]);

  if (!state) {
    return (
      <span
        className={cn(
          "inline-block h-8 w-36 animate-pulse rounded-full bg-sand",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs leading-none font-bold text-ink",
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-60",
            state.isOpen ? "animate-ping bg-emerald-500" : "bg-red-400",
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            state.isOpen ? "bg-emerald-500" : "bg-red-400",
          )}
        />
      </span>
      {state.label}
    </span>
  );
}
