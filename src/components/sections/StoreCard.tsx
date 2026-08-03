import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/content";

/**
 * Store card in the tile language: rounded-xl cream card with a white logo
 * plate, warming to sand on hover while the logo gently scales.
 */
export function StoreCard({
  store,
  className,
}: {
  store: Store;
  className?: string;
}) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className={cn(
        "group focus-brand relative flex h-full transform-gpu flex-col overflow-hidden rounded-xl bg-cream transition-all duration-200 ease-in-out hover:bg-sand",
        className,
      )}
    >
      {/* Logo plate */}
      <div className="relative m-3 flex h-32 items-center justify-center rounded-lg bg-white px-8 sm:h-36">
        {store.logo ? (
          <Image
            src={store.logo}
            alt={`${store.name} logo`}
            width={200}
            height={96}
            className="max-h-20 w-auto max-w-[70%] object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        ) : (
          <span className="font-title text-2xl font-extrabold text-ink/25">
            {store.name}
          </span>
        )}
        {store.unit ? (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-cream px-2.5 py-1 text-[11px] leading-none font-bold text-ink-soft">
            Unit {store.unit}
          </span>
        ) : null}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col px-5 pt-1 pb-5">
        <p className="text-xs font-bold text-ink-soft">{store.category}</p>
        <h3 className="heading-m mt-1 text-ink">{store.name}</h3>
        {store.excerpt ? (
          <p className="text-body mt-1 line-clamp-2 text-ink-soft">
            {store.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
