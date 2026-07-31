import { NextResponse } from "next/server";
import { z } from "zod";
import { contact } from "@/lib/content";

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(4000),
  /** Honeypot — humans never fill this. */
  company: z.string().max(0).optional().or(z.literal("")),
});

/**
 * Contact form delivery. If CONTACT_WEBHOOK_URL is set (e.g. a Zapier/Make
 * hook or an email-service endpoint), the submission is forwarded there.
 * Otherwise, in development, submissions are appended to .data/messages.json
 * so the flow is fully testable locally.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields." },
      { status: 422 },
    );
  }
  if (parsed.data.company) {
    // Honeypot tripped — pretend success, deliver nothing.
    return NextResponse.json({ ok: true });
  }
  if (!contact.form.subjects.includes(parsed.data.subject)) {
    return NextResponse.json({ error: "Unknown subject." }, { status: 422 });
  }

  const submission = {
    ...parsed.data,
    company: undefined,
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch(() => null);
    if (!res?.ok) {
      return NextResponse.json(
        { error: "We couldn't send your message just now — please try again, or email us directly." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (process.env.NODE_ENV !== "production") {
    const { appendJsonRecord } = await import("@/lib/localInbox");
    await appendJsonRecord("messages.json", submission);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "The contact form isn't configured yet — please email us directly." },
    { status: 503 },
  );
}
