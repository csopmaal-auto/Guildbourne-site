"use client";

/** The enquiry form — react-hook-form + zod, honeypot, accessible errors. */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ContactContent } from "@/types/content";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().min(1, "Please choose a subject."),
  message: z.string().trim().min(10, "Please give us a little more detail."),
  company: z.string().max(0).optional().or(z.literal("")), // honeypot
});
type FormValues = z.infer<typeof schema>;

export function ContactForm({ form }: { form: ContactContent["form"] }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subject: "" },
  });

  const subject = watch("subject");

  const onSubmit = async (values: FormValues) => {
    setState("idle");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  };

  if (state === "done") {
    return (
      <div
        className="flex h-full min-h-72 flex-col items-center justify-center rounded-xl bg-white p-10 text-center"
        role="status"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-yellow text-ink">
          <Check className="size-5" aria-hidden />
        </span>
        <h3 className="heading-m mt-5 text-ink">{form.successHeading}</h3>
        <p className="text-body mt-2 max-w-sm text-ink-soft">
          {form.successBody}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" error={errors.name?.message} required>
          <Input
            {...register("name")}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className="h-11"
          />
        </FormField>
        <FormField label="Email" error={errors.email?.message} required>
          <Input
            type="email"
            {...register("email")}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className="h-11"
          />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Phone (optional)" error={errors.phone?.message}>
          <Input
            type="tel"
            {...register("phone")}
            autoComplete="tel"
            className="h-11"
          />
        </FormField>
        <FormField label="Subject" error={errors.subject?.message} required>
          <Select value={subject} onValueChange={(v) => setValue("subject", v, { shouldValidate: true })}>
            <SelectTrigger
              className="h-11 w-full"
              aria-invalid={Boolean(errors.subject)}
            >
              <SelectValue placeholder="Choose a subject…" />
            </SelectTrigger>
            <SelectContent>
              {form.subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <FormField label="Message" error={errors.message?.message} required>
        <Textarea
          rows={6}
          {...register("message")}
          aria-invalid={Boolean(errors.message)}
        />
      </FormField>

      {/* Honeypot — hidden from humans, tempting to bots */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Company
          <input type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
        </label>
      </div>

      {state === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          Something went wrong sending your message — please try again, or email
          us directly.
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="xl" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Send className="size-3.5" aria-hidden />
        )}
        Send message
      </Button>
    </form>
  );
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn("text-[13px] font-semibold", error && "text-destructive")}>
        {label}
        {required ? <span className="ml-0.5 text-ink-soft">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
