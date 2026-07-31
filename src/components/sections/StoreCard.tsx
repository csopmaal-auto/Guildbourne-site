import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/content";

/**
 * The premium store card — white logo plate on stone, gold border sweep on
 * hover. Used by the homepage carousel and the directory grid.
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
        "group relative flex h-full flex-col overflow-hidden border border-transparent bg-white shadow-[0_1px_2px_rgba(28,27,24,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_18px_40px_-18px_rgba(28,27,24,0.28)] focus-gold",
        className,
      )}
    >
      {/* Logo plate */}
      <div className="relative flex h-36 items-center justify-center bg-stone/60 px-8 transition-colors duration-500 group-hover:bg-stone sm:h-40">
        {store.logo ? (
          <Image
            src={store.logo}
            alt={`${store.name} logo`}
            width={200}
            height={96}
            className="max-h-20 w-auto max-w-[70%] object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        ) : (
          <span className="text-2xl font-extrabold tracking-tight text-charcoal/25">
            {store.name}
          </span>
        )}
        {store.unit ? (
          <span className="absolute top-3 right-3 rounded-full bg-charcoal/85 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-ivory/90">
            Unit {store.unit}
          </span>
        ) : null}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col px-5 py-4">
        <p className="text-[10px] font-bold tracking-[0.22em] text-bronze uppercase">
          {store.category}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug font-bold tracking-tight text-charcoal">
            {store.name}
          </h3>
          <ArrowUpRight
            className="mt-1 size-4 shrink-0 text-charcoal/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze"
            aria-hidden
          />
        </div>
        {store.excerpt ? (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {store.excerpt}
          </p>
        ) : null}
      </div>

      {/* Gold sweep */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-bronze transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
      />
    </Link>
  );
}
