import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { CoverImage } from "@/components/ui/media";
import { formatDateRange } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { CentreEvent } from "@/types/content";

/** Event card with the editorial date block. */
export function EventCard({
  event,
  past = false,
  className,
}: {
  event: CentreEvent;
  past?: boolean;
  className?: string;
}) {
  const [day, month] = splitDate(event.startDate);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-charcoal/8 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_18px_40px_-18px_rgba(28,27,24,0.28)] focus-gold",
        past && "opacity-75 saturate-50 hover:opacity-100 hover:saturate-100",
        className,
      )}
    >
      <div className="media-zoom relative h-44">
        <CoverImage
          src={event.image || undefined}
          alt=""
          sizes="(min-width:1024px) 33vw, 100vw"
          className="absolute inset-0"
        />
        <div className="absolute top-4 left-4 flex size-14 flex-col items-center justify-center bg-ivory text-charcoal shadow-md">
          <span className="text-xl leading-none font-extrabold tracking-tight">
            {day}
          </span>
          <span className="mt-0.5 text-[9px] font-bold tracking-[0.18em] uppercase">
            {month}
          </span>
        </div>
        {past ? (
          <span className="absolute right-4 bottom-4 bg-charcoal/80 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-ivory uppercase backdrop-blur-sm">
            Past event
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold tracking-[0.22em] text-bronze uppercase">
          {formatDateRange(event.startDate, event.endDate)}
        </p>
        <h3 className="mt-1.5 text-lg leading-snug font-bold tracking-tight text-charcoal transition-colors group-hover:text-bronze">
          {event.title}
        </h3>
        {event.excerpt ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {event.excerpt}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-muted-foreground">
          {event.timeLabel ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden /> {event.timeLabel}
            </span>
          ) : null}
          {event.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden /> {event.location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function splitDate(iso: string): [string, string] {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return ["–", ""];
  return [
    String(date.getDate()),
    new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
  ];
}
