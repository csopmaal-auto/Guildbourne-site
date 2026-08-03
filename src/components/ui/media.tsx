import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cover imagery with a branded fallback — content without a photo still gets
 * a composed pastel panel rather than a broken layout.
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
    <div className={cn("relative overflow-hidden bg-sand", className)}>
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

/** Pastel panel with the squiggle pattern — the "no image yet" state. */
export function PlaceholderPanel({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("tile-pattern absolute inset-0 bg-sand text-ink-soft", className)}
    />
  );
}
