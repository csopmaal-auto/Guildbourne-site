import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_TTL_MS,
  checkPassword,
  createSession,
  isAuthConfigured,
} from "@/lib/adminAuth";

export async function POST(req: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin login is not configured — set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
      },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    password?: string;
  } | null;
  if (!body?.password || !(await checkPassword(body.password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
