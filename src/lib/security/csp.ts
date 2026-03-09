/**
 * Content Security Policy helpers
 *
 * Generates a per-request nonce and builds the CSP header string.
 * The nonce-based approach replaces `unsafe-eval` / `unsafe-inline` in
 * production, eliminating the main XSS injection vectors.
 *
 * Usage (middleware):
 * ```ts
 * const nonce = generateNonce();
 * const csp   = buildCSP(nonce);
 * response.headers.set("Content-Security-Policy", csp);
 * requestHeaders.set("x-nonce", nonce); // pass to layout
 * ```
 */

import { randomBytes } from "crypto";

/** Generate a 16-byte base64 nonce for a single request. */
export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

/** Build the full CSP header value for the given nonce. */
export function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    // In dev: keep unsafe-eval for HMR / fast-refresh. In prod: nonce only.
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'", // Required for Tailwind CSS-in-JS
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      "https://*.googleapis.com",
      "https://*.google.com",
      "https://*.firebase.com",
      "https://*.firebaseio.com",
      "https://*.cloudfunctions.net",
    ].join(" "),
    "frame-src 'self' https://accounts.google.com",
    "media-src 'self' https: blob:",
    "worker-src 'self' blob:",
  ].join("; ");
}
