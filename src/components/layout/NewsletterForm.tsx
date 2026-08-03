"use client";

/** Newsletter signup — rounded input + yellow round submit, RHF + zod. */
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

export function NewsletterForm({ className }: { className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
        className={cn("flex items-center gap-2 text-sm font-bold text-ink", className)}
        role="status"
      >
        <span className="grid size-8 place-items-center rounded-full bg-yellow">
          <Check className="size-4" aria-hidden />
        </span>
        You&rsquo;re on the list — thank you.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div className="flex items-center gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          autoComplete="email"
          {...register("email")}
          className="h-12 w-full rounded-full border border-sand bg-white px-5 text-sm text-ink transition-colors outline-none placeholder:text-ink-soft focus:border-ink-soft"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label="Subscribe"
          className="focus-brand grid size-12 shrink-0 place-items-center rounded-full bg-yellow text-ink transition-colors hover:bg-yellow-dark"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {errors.email ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {errors.email.message}
        </p>
      ) : null}
      {state === "error" ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          Sign-up didn&rsquo;t go through — please try again later.
        </p>
      ) : null}
    </form>
  );
}
