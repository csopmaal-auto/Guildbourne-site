import type { Metadata } from "next";
import { HeroCarousel } from "@/components/sections/home/HeroCarousel";
import { Tile } from "@/components/sections/home/Tile";
import { homepage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/");
export const dynamic = "force-static";

/**
 * The split homepage (reference pattern): a sticky full-height hero carousel
 * on the left, a two-column mosaic of navigation tiles scrolling past it on
 * the right. The second tile column starts lower to clear the header's
 * opening-hours pill.
 */
export default function HomePage() {
  const tiles = homepage.tiles;
  const columnA = tiles.filter((_, i) => i % 2 === 0);
  const columnB = tiles.filter((_, i) => i % 2 === 1);

  return (
    <div className="grid grid-cols-11 gap-5 bg-white lg:px-6">
      {/* Left: sticky hero */}
      <div className="col-span-11 lg:col-span-5">
        <section className="relative top-0 z-10 bg-white lg:sticky lg:pt-6">
          <HeroCarousel slides={homepage.hero.slides} />
        </section>
      </div>

      {/* Right: mosaic feed */}
      <div className="col-span-11 px-5 lg:col-span-6 lg:mt-6 lg:px-0">
        <div className="flex gap-5 pb-10">
          <div className="flex w-full flex-col lg:w-1/2">
            {columnA.map((tile) => (
              <Tile key={tile.href + tile.title} tile={tile} className="mb-5" />
            ))}
            {/* On mobile the columns collapse into one — render B's tiles too */}
            <div className="lg:hidden">
              {columnB.map((tile) => (
                <Tile key={tile.href + tile.title} tile={tile} className="mb-5" />
              ))}
            </div>
          </div>
          <div className="hidden w-1/2 flex-col lg:mt-[6.75rem] lg:flex">
            {columnB.map((tile) => (
              <Tile key={tile.href + tile.title} tile={tile} className="mb-5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
