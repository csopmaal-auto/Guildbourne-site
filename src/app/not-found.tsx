import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-title text-sm font-bold text-ink-soft">Page not found</p>
      <h1 className="font-title mt-4 text-[7rem] leading-none font-extrabold text-yellow drop-shadow-[0_2px_0_rgba(71,71,71,0.15)] sm:text-[10rem]">
        404
      </h1>
      <p className="text-body-l mt-6 max-w-md text-ink-soft">
        The page you&rsquo;re after seems to have wandered off — perhaps towards
        the seafront. Let&rsquo;s get you back inside.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="gold" size="xl">
          <Link href="/">Back to the homepage</Link>
        </Button>
        <Button asChild variant="outline-dark" size="xl">
          <Link href="/stores">Browse the stores</Link>
        </Button>
      </div>
    </div>
  );
}
