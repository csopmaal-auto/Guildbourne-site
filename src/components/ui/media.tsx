import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cover imagery with a branded fallback — content without a photo still gets
 * a composed charcoal panel rather than a broken layout.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  priority,
  className,
  imgClassName,
}: {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-stone-dark", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <PlaceholderPanel />
      )}
    </div>
  );
}

/** Charcoal panel with a quiet gold monogram — the "no image yet" state. */
export function PlaceholderPanel({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-charcoal-soft to-charcoal",
        className,
      )}
    >
      <span className="select-none text-6xl font-extrabold tracking-tight text-gold/15">
        G
      </span>
    </div>
  );
}
