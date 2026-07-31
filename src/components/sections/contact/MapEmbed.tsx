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
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-charcoal/10 sm:aspect-[16/8]">
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
    <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-4 overflow-hidden border border-charcoal/10 bg-charcoal bg-grain text-center sm:aspect-[16/8]">
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--ivory)_1px,transparent_1px),linear-gradient(90deg,var(--ivory)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <MapPin className="size-8 text-gold" aria-hidden />
      <div className="relative">
        <p className="font-bold text-ivory">{query}</p>
        <p className="mt-1 text-xs text-ivory/60">
          The map loads from Google when you open it.
        </p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Button variant="gold" size="xl" onClick={() => setLoaded(true)}>
          Load the map
        </Button>
        {mapLink ? (
          <Button asChild variant="outline-light" size="xl">
            <a href={mapLink} target="_blank" rel="noopener noreferrer">
              {linkLabel || "Open in Google Maps"}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
