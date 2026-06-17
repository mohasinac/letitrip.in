/**
 * /api/media/ext HMAC signing + verification.
 *
 * Config-gated: when `MEDIA_EXT_HMAC_SECRET` is unset, signing is a no-op and
 * the route accepts unsigned requests (back-compat with all existing callers).
 * When the secret is set in Vercel env, every request must carry a valid
 * `sig` + `ts` query pair or the route returns 401. Callers use
 * `signExtMediaUrl(rawUrl)` to produce the signed proxy URL.
 *
 * Replay window: 60 seconds. Beyond that, signatures are rejected even if
 * cryptographically valid, so leaked URLs in caches don't outlive their TTL.
 *
 * Digest: HMAC-SHA-256 over `${encoded-url}.${ts}`. The encoded URL is the
 * value as it appears in the `url=` query parameter so caller-side and
 * route-side agree on the exact bytes.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const REPLAY_WINDOW_MS = 60_000;
const SECRET_ENV = "MEDIA_EXT_HMAC_SECRET";

function readSecret(): string | null {
  const v = process.env[SECRET_ENV];
  return v && v.length > 0 ? v : null;
}

/** True when HMAC enforcement is enabled (env var is set). */
export function isExtHmacEnabled(): boolean {
  return readSecret() !== null;
}

/**
 * Compute HMAC-SHA-256 over `${encodedUrl}.${ts}` keyed with the configured
 * secret. Returns a hex digest. Throws if the secret is not configured —
 * callers must check `isExtHmacEnabled()` before signing.
 */
export function computeExtSignature(encodedUrl: string, ts: number): string {
  const secret = readSecret();
  if (!secret) {
    throw new Error(
      `${SECRET_ENV} is not set — cannot sign /api/media/ext URLs. ` +
        `Either set the env var or call resolveMediaUrl() instead of signExtMediaUrl().`,
    );
  }
  return createHmac("sha256", secret).update(`${encodedUrl}.${ts}`).digest("hex");
}

/**
 * Wrap an external URL with HMAC sig + timestamp. When HMAC is disabled
 * (no secret configured) returns the URL with no signature — same behaviour
 * as the unsigned `MEDIA_ENDPOINTS.EXT_URL` helper, so callers can adopt
 * this signer unconditionally and have it kick in once ops sets the secret.
 *
 * SSR-only — never call from a client component (the secret would leak to
 * the bundle). Server actions and route handlers are safe.
 */
export function signExtMediaUrl(rawUrl: string): string {
  const encoded = encodeURIComponent(rawUrl);
  if (!isExtHmacEnabled()) {
    return `/api/media/ext?url=${encoded}`;
  }
  const ts = Date.now();
  const sig = computeExtSignature(encoded, ts);
  return `/api/media/ext?url=${encoded}&ts=${ts}&sig=${sig}`;
}

interface VerifyResult {
  ok: boolean;
  reason?: "DISABLED" | "MISSING" | "EXPIRED" | "MISMATCH";
}

/**
 * Verify a request's signature. When HMAC is disabled, always returns
 * `{ ok: true, reason: "DISABLED" }` so the route can branch on the reason
 * for logging.
 */
export function verifyExtSignature(
  encodedUrl: string,
  ts: string | null,
  sig: string | null,
  now: number = Date.now(),
): VerifyResult {
  if (!isExtHmacEnabled()) return { ok: true, reason: "DISABLED" };
  if (!ts || !sig) return { ok: false, reason: "MISSING" };
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return { ok: false, reason: "MISSING" };
  if (Math.abs(now - tsNum) > REPLAY_WINDOW_MS) return { ok: false, reason: "EXPIRED" };
  let expected: string;
  try {
    expected = computeExtSignature(encodedUrl, tsNum);
  } catch {
    return { ok: false, reason: "MISMATCH" };
  }
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return { ok: false, reason: "MISMATCH" };
  return timingSafeEqual(a, b) ? { ok: true } : { ok: false, reason: "MISMATCH" };
}
