import { NextResponse } from "next/server";
import { z } from "zod";
import { settings } from "@/lib/content";

const schema = z.object({
  email: z.string().trim().email().max(200),
});

/**
 * Newsletter signup. Forwards to the provider endpoint configured in
 * Site settings (or NEWSLETTER_ENDPOINT env). In development, falls back
 * to the local .data inbox so the flow is testable end-to-end.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  const endpoint =
    process.env.NEWSLETTER_ENDPOINT || settings.newsletter.endpoint;

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email }),
    }).catch(() => null);
    if (!res?.ok) {
      return NextResponse.json(
        { error: "Sign-up didn't go through — please try again later." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (process.env.NODE_ENV !== "production") {
    const { appendJsonRecord } = await import("@/lib/localInbox");
    await appendJsonRecord("newsletter.json", {
      email: parsed.data.email,
      subscribedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Newsletter sign-up isn't configured yet." },
    { status: 503 },
  );
}
