import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { CoverImage } from "@/components/ui/media";
import { formatDateRange } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { CentreEvent } from "@/types/content";

/**
 * Event card as a mosaic tile: rounded image (or pastel block), white date
 * chip, caption overlaid on the gradient; hover darkens the tile and turns
 * the title yellow.
 */
export function EventCard({
  event,
  past = false,
  className,
}: {
  event: CentreEvent;
  past?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "tile group focus-brand h-full min-h-72 text-white",
        past && "opacity-75 saturate-50 hover:opacity-100 hover:saturate-100",
        className,
      )}
    >
      {event.image ? (
        <CoverImage
          src={event.image}
          alt=""
          sizes="(min-width:1024px) 33vw, 100vw"
          className="absolute inset-0"
        />
      ) : (
        <span aria-hidden className="tile-pattern absolute inset-0 bg-tile-red text-tile-red-text" />
      )}
      <div className="tile-gradient absolute inset-0 transition-all duration-200 ease-in-out lg:group-hover:bg-backdrop">
        <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs leading-none font-bold text-ink">
          {formatDateRange(event.startDate, event.endDate)}
        </span>
        {past ? (
          <span className="absolute top-4 right-4 rounded-full bg-ink/70 px-3 py-1.5 text-xs leading-none font-bold text-white">
            Past event
          </span>
        ) : null}
        <div className="tile-caption">
          <h3 className="heading-m transition-all duration-200 ease-in-out lg:group-hover:text-yellow">
            {event.title}
          </h3>
          {event.excerpt ? (
            <p className="text-body mt-1 line-clamp-2">{event.excerpt}</p>
          ) : null}
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
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
          </p>
        </div>
      </div>
    </Link>
  );
}
