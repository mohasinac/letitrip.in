/**
 * Edge-safe session role decoder — the SINGLE place outside auth-server.ts that
 * is allowed to read the `__session` cookie. Required because the proxy
 * (src/proxy.ts) runs on the Edge runtime where firebase-admin is unavailable;
 * the proxy needs a cheap first-gate role check before the page renders.
 *
 * Security:
 *   - No signature verification here. This is a *cheap first gate* only.
 *   - The RSC layout / route-handler chain re-verifies via the server-side
 *     session helper (getServerSessionUser / requireAuthFromRequest).
 *   - Decoding-only means a forged role string lets the request reach the RSC,
 *     where the real verification rejects it.
 *
 * audit-inline-session-cookie allowlists this file explicitly.
 */

import type { NextRequest } from "next/server";

/** Read the __session cookie value off a NextRequest. Returns null when absent. */
export function readEdgeSessionCookie(request: NextRequest): string | null {
  return request.cookies.get("__session")?.value ?? null;
}

/**
 * Decode the JWT payload of a Firebase session cookie WITHOUT signature
 * verification. Edge-safe (uses globalThis.atob, JSON.parse). Returns null
 * on any parse error.
 */
export function decodeEdgeSessionRole(cookie: string | null): string | null {
  if (!cookie) return null;
  try {
    const parts = cookie.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}
