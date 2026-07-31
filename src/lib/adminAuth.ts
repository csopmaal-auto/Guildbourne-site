/**
 * Admin session auth — no auth library, just Web Crypto.
 *
 * Login compares the typed password against ADMIN_PASSWORD in constant time
 * (both sides are SHA-256 hashed first, so length isn't leaked either) and
 * sets a signed, httpOnly session cookie: `<expiryMs>.<hmacSha256>`.
 * The middleware gate verifies the signature + expiry on every /admin request.
 *
 * Works in both the Node runtime (API routes) and the Edge runtime (middleware).
 */

export const ADMIN_COOKIE = "gb_admin_session";
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const encoder = new TextEncoder();

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && getSecret());
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Constant-time password check (hash both sides first). */
export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const digest = async (v: string) => {
    const d = await crypto.subtle.digest("SHA-256", encoder.encode(v));
    return Array.from(new Uint8Array(d))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };
  return constantTimeEqual(await digest(candidate), await digest(expected));
}

/** Create a signed session token valid for SESSION_TTL_MS. */
export async function createSession(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await hmac(String(exp), getSecret());
  return `${exp}.${sig}`;
}

/** Verify a session token: signature must match and expiry be in the future. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !getSecret()) return false;
  const [expRaw, sig] = token.split(".");
  if (!expRaw || !sig) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(expRaw, getSecret());
  return constantTimeEqual(sig, expected);
}
