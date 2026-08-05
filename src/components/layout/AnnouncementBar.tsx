"use client";

/**
 * The site-wide announcement strip (settings → announcement). Sits in normal
 * flow above the floating header, so it scrolls away with the page. Dismissal
 * is per-session and keyed by the message text, so a new announcement
 * reappears for everyone.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Settings } from "@/types/content";

const DISMISS_KEY = "gb-announcement-dismissed";

export function AnnouncementBar({
  announcement,
}: {
  announcement: Settings["announcement"];
}) {
  // Render by default so fresh visitors get the bar server-side with no
  // layout shift; hide after mount only for users who dismissed this exact
  // message earlier in the session.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === announcement.text) {
        setDismissed(true);
      }
    } catch {
      /* storage unavailable — keep showing */
    }
  }, [announcement.text]);

  if (!announcement.enabled || !announcement.text || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, announcement.text);
    } catch {
      /* storage unavailable — dismiss for this render only */
    }
  };

  return (
    <div className="relative z-40 bg-ink text-cream">
      {/* Right padding clears the dismiss X and the fixed round menu button beyond it. */}
      <div className="flex min-h-10 items-center gap-x-3 py-2 pl-5 pr-[7.75rem] text-sm leading-snug sm:pr-[8.75rem] lg:justify-center lg:px-[9.5rem]">
        <p className="font-semibold">
          {announcement.text}
          {announcement.link && announcement.linkLabel ? (
            <Link
              href={announcement.link}
              className="focus-brand ml-2.5 inline-block rounded-sm font-bold text-yellow underline decoration-2 underline-offset-4 transition-colors hover:text-yellow-dark"
            >
              {announcement.linkLabel}
            </Link>
          ) : null}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={dismiss}
        className="focus-brand absolute top-1/2 right-[5.5rem] grid size-7 -translate-y-1/2 place-items-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-cream sm:right-[6.5rem] lg:right-[7.25rem]"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
