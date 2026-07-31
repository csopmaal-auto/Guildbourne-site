"use client";

/** Newsletter signup — react-hook-form + zod, posting to /api/newsletter. */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});
type FormValues = z.infer<typeof schema>;

export function NewsletterForm({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const dark = tone === "dark";

  const onSubmit = async (values: FormValues) => {
    setState("idle");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  };

  if (state === "done") {
    return (
      <p
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          dark ? "text-gold" : "text-bronze",
          className,
        )}
        role="status"
      >
        <Check className="size-4" aria-hidden /> You&rsquo;re on the list — thank
        you.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div
        className={cn(
          "flex items-stretch border-b transition-colors focus-within:border-gold",
          dark ? "border-ivory/30" : "border-charcoal/30",
        )}
      >
        <label htmlFor={`newsletter-${tone}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${tone}`}
          type="email"
          placeholder="Your email address"
          autoComplete="email"
          {...register("email")}
          className={cn(
            "h-12 w-full bg-transparent text-sm outline-none",
            dark
              ? "text-ivory placeholder:text-ivory/40"
              : "text-charcoal placeholder:text-charcoal/40",
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label="Subscribe"
          className={cn(
            "inline-flex w-12 shrink-0 items-center justify-center transition-colors focus-gold",
            dark ? "text-gold hover:text-gold-soft" : "text-bronze hover:text-charcoal",
          )}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {errors.email ? (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {errors.email.message}
        </p>
      ) : null}
      {state === "error" ? (
        <p className="mt-2 text-xs text-red-400" role="alert">
          Sign-up didn&rsquo;t go through — please try again later.
        </p>
      ) : null}
    </form>
  );
}
