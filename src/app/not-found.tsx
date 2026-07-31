import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-charcoal bg-grain px-6 text-center text-ivory">
      <p className="eyebrow-light">Page not found</p>
      <h1 className="mt-6 text-[7rem] leading-none font-extrabold tracking-tight text-gold/90 sm:text-[10rem]">
        404
      </h1>
      <p className="mt-6 max-w-md text-ivory/70">
        The page you&rsquo;re after seems to have wandered off — perhaps towards
        the seafront. Let&rsquo;s get you back inside.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="gold" size="xl">
          <Link href="/">Back to the homepage</Link>
        </Button>
        <Button asChild variant="outline-light" size="xl">
          <Link href="/stores">Browse the stores</Link>
        </Button>
      </div>
    </div>
  );
}
