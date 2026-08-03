"use client";

/**
 * Site-wide instant search — a command-palette style overlay over a compact
 * index of stores, offers, events, news and pages. Pure client-side filtering,
 * keyboard navigable (↑/↓/Enter), built on Radix Dialog for focus handling.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type SearchItem = {
  type: "Store" | "Offer" | "Event" | "News" | "Page";
  title: string;
  subtitle?: string;
  href: string;
};

export function SearchOverlay({
  open,
  onOpenChange,
  index,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index: SearchItem[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [index, query]);

  const go = (href: string) => {
    onOpenChange(false);
    // Let the dialog close before navigating so scroll isn't locked.
    requestAnimationFrame(() => {
      window.location.assign(href);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].href);
    }
  };

  useEffect(() => {
    listRef.current
      ?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-24 max-w-xl translate-y-0 overflow-hidden rounded-xl border-sand p-0 shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search the site</DialogTitle>
          <DialogDescription>
            Search stores, offers, events and news.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b px-5">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search stores, offers, events…"
            aria-label="Search"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Search results"
          className="max-h-[50vh] overflow-y-auto p-2"
          data-lenis-prevent
        >
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing found for “{query}”.
            </li>
          ) : (
            results.map((item, i) => (
              <li key={`${item.href}-${item.title}`} role="option" aria-selected={i === active}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.href);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                    i === active ? "bg-cream" : "hover:bg-cream/70",
                  )}
                >
                  <span className="w-12 shrink-0 text-[10px] font-bold tracking-wider text-ink-soft uppercase">
                    {item.type}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.title}
                    </span>
                    {item.subtitle ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
