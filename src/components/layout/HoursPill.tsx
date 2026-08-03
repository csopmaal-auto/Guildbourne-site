"use client";

/**
 * The opening-hours pill (reference: header top-right card) — centre name +
 * "Open today: 8:00 AM – 6:00 PM", cream background, hover to sand.
 * Times are computed client-side so static pages never show a stale day.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WeekHours } from "@/types/content";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function formatAmPm(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

export function HoursPill({
  siteName,
  hours,
  className,
}: {
  siteName: string;
  hours: WeekHours;
  className?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const weekday = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
    })
      .format(new Date())
      .toLowerCase() as (typeof DAY_KEYS)[number];
    const today = hours[weekday] ?? hours[DAY_KEYS.includes(weekday) ? weekday : "monday"];
    setLabel(
      today && !today.closed
        ? `Open today: ${formatAmPm(today.open)} – ${formatAmPm(today.close)}`
        : "Closed today",
    );
  }, [hours]);

  return (
    <Link href="/contact" className={cn("block focus-brand rounded-[20px]", className)}>
      <div className="w-full rounded-[20px] bg-cream p-4 transition-colors duration-200 hover:bg-sand">
        <div className="flex flex-col">
          <span className="font-title text-sm leading-[18px] font-bold text-ink">
            {siteName}
          </span>
          <span className="text-xs leading-[18px] whitespace-nowrap text-ink">
            {label ?? "Opening hours"}
          </span>
        </div>
      </div>
    </Link>
  );
}
