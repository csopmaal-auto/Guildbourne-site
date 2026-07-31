import type { DayHours, WeekHours } from "@/types/content";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const satisfies readonly (keyof WeekHours)[];

type LondonNow = { day: keyof WeekHours; minutes: number };

/** Current day + minutes-since-midnight in the centre's timezone (Europe/London). */
function londonNow(date = new Date()): LondonNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday").toLowerCase();
  const day =
    DAY_KEYS.find((d) => d.startsWith(weekday.slice(0, 3))) ?? "monday";
  // `hour` can be "24" at midnight in some engines; normalise to 0.
  const hour = Number(get("hour")) % 24;
  const minutes = hour * 60 + Number(get("minute"));
  return { day, minutes };
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export type OpenState = {
  isOpen: boolean;
  /** Human label, e.g. "Open until 6:00pm" / "Opens 8:00am" */
  label: string;
  today: DayHours;
};

const formatTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
};

/** Whether the centre is open right now, with a display label. */
export function getOpenState(hours: WeekHours, date = new Date()): OpenState {
  const { day, minutes } = londonNow(date);
  const today = hours[day];

  if (!today || today.closed) {
    return { isOpen: false, label: "Closed today", today };
  }

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);

  if (minutes >= open && minutes < close) {
    return {
      isOpen: true,
      label: `Open until ${formatTime(today.close)}`,
      today,
    };
  }
  if (minutes < open) {
    return {
      isOpen: false,
      label: `Opens ${formatTime(today.open)} today`,
      today,
    };
  }
  // After closing — show tomorrow's opening time.
  const idx = DAY_KEYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = hours[DAY_KEYS[(idx + i) % 7]];
    if (next && !next.closed) {
      return {
        isOpen: false,
        label: `Opens ${formatTime(next.open)} ${i === 1 ? "tomorrow" : ""}`.trim(),
        today,
      };
    }
  }
  return { isOpen: false, label: "Closed", today };
}
