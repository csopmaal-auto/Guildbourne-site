/** Format an ISO date (yyyy-mm-dd) as e.g. "15 August 2026". */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Short form, e.g. "15 Aug". */
export function formatDateShort(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/** Date range label: "15 Aug" or "27–29 Oct" or "30 Oct – 2 Nov". */
export function formatDateRange(startIso: string, endIso?: string): string {
  if (!endIso || endIso === startIso) return formatDateShort(startIso);
  const start = new Date(`${startIso}T12:00:00`);
  const end = new Date(`${endIso}T12:00:00`);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${new Intl.DateTimeFormat("en-GB", { month: "short" }).format(end)}`;
  }
  return `${formatDateShort(startIso)} – ${formatDateShort(endIso)}`;
}

/** Whole days from now until an ISO date (end of day); negative if past. */
export function daysUntil(iso: string, now = new Date()): number {
  const target = new Date(`${iso}T23:59:59`);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}
