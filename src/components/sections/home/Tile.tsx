/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HomeTile, TilePalette } from "@/types/content";

/**
 * The mosaic tile — the site's core card primitive (reference pattern).
 *
 * Image tiles: natural-ratio image, bottom gradient, white caption; on hover
 * the whole tile darkens and the title turns yellow.
 * Colour tiles: pastel background with matching deep text and an optional
 * decorative squiggle; the subtitle stays hidden until hover; the tile dims
 * slightly (brightness) on hover.
 */
const PALETTES: Record<TilePalette, string> = {
  yellow: "bg-yellow text-ink",
  red: "bg-tile-red text-tile-red-text",
  blue: "bg-tile-blue text-tile-blue-text",
  green: "bg-tile-green text-tile-green-text",
  sand: "bg-sand text-ink",
};

export function Tile({ tile, className }: { tile: HomeTile; className?: string }) {
  if (tile.type === "image" && tile.image) {
    return (
      <Link
        href={tile.href}
        className={cn("tile group text-white focus-brand", className)}
      >
        <img src={tile.image} alt="" className="block w-full object-cover" />
        <div className="tile-gradient absolute inset-0 transition-all duration-200 ease-in-out lg:group-hover:bg-backdrop">
          <div className="tile-caption">
            <h2 className="heading-m transition-all duration-200 ease-in-out lg:group-hover:text-yellow">
              {tile.title}
            </h2>
            {tile.subtitle ? <p className="text-body">{tile.subtitle}</p> : null}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={tile.href}
      className={cn(
        "tile group aspect-[1/0.7] w-full transition-all duration-200 ease-in-out lg:hover:brightness-90",
        PALETTES[tile.palette] ?? PALETTES.sand,
        className,
      )}
    >
      {tile.pattern ? (
        <span aria-hidden className="tile-pattern absolute inset-0" />
      ) : null}
      <div className="absolute inset-0">
        <div className="tile-caption">
          <h2 className="heading-m">{tile.title}</h2>
          {tile.subtitle ? (
            <p className="text-body max-h-0 overflow-hidden opacity-0 transition-all duration-200 ease-in-out lg:group-hover:max-h-20 lg:group-hover:opacity-100">
              {tile.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
