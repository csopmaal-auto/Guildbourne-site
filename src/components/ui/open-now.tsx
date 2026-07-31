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
  tone = "light",
  className,
}: {
  hours: WeekHours;
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
        className={cn("inline-block h-6 w-32 animate-pulse rounded-full bg-current opacity-10", className)}
        aria-hidden
      />
    );
  }

  const dark = tone === "dark";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase",
        dark
          ? "border-ivory/20 text-ivory/85"
          : "border-charcoal/15 text-charcoal/80",
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
