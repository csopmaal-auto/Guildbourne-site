"use client";

/**
 * Newsletter slide-over (reference pattern): a full-height panel sliding in
 * from the right over a dimmed backdrop, with a round close button.
 */
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

export function NewsletterPanel({
  open,
  onClose,
  newsletter,
}: {
  open: boolean;
  onClose: () => void;
  newsletter: { heading: string; body: string; disclaimer: string };
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <motion.button
            type="button"
            aria-label="Close newsletter panel"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-backdrop"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter sign-up"
            data-lenis-prevent
            initial={{ x: "12%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "10%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto rounded-l-[2rem] bg-cream p-8 pt-20 sm:p-10 sm:pt-24"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="focus-brand absolute top-5 right-5 grid size-12 place-items-center rounded-full bg-sand text-ink transition-colors hover:bg-white"
            >
              <X className="size-5" aria-hidden />
            </button>
            <h2 className="heading-l text-ink">{newsletter.heading}</h2>
            <p className="text-body mt-4 text-ink-soft">{newsletter.body}</p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
            {newsletter.disclaimer ? (
              <p className="mt-4 text-xs text-ink-soft">{newsletter.disclaimer}</p>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
