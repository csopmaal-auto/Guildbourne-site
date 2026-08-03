"use client";

/**
 * Privacy-friendly map: a styled placeholder until the visitor chooses to
 * load the embed (no third-party requests before consent), with a direct
 * Google Maps link alongside.
 */
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MapEmbed({ query, mapLink, linkLabel }: { query: string; mapLink: string; linkLabel: string }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xxl sm:aspect-[16/8]">
        <iframe
          title={`Map showing ${query}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="tile-pattern relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xxl bg-tile-blue text-center text-tile-blue-text sm:aspect-[16/8]">
      <MapPin className="size-8" aria-hidden />
      <div className="relative">
        <p className="heading-m">{query}</p>
        <p className="text-body mt-1 opacity-80">
          The map loads from Google when you open it.
        </p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Button variant="gold" size="xl" onClick={() => setLoaded(true)}>
          Load the map
        </Button>
        {mapLink ? (
          <Button asChild variant="charcoal" size="xl">
            <a href={mapLink} target="_blank" rel="noopener noreferrer">
              {linkLabel || "Open in Google Maps"}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
