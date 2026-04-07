/**
 * Next.js Proxy
 *
 * Responsibilities:
 * 1. Locale routing via next-intl (redirect /products → /en/products etc.)
 * 2. Static CSP header injection
 *
 * Note: Per-request nonce-based CSP was removed because injecting a unique
 * nonce into request headers forces `headers()` calls in layouts, which opts
 * ALL routes into dynamic SSR and prevents Vercel ISR caching entirely.
 * The static CSP uses 'strict-dynamic' + 'unsafe-inline' — modern browsers
 * that support strict-dynamic ignore unsafe-inline, maintaining strong
 * security while enabling CDN caching.
 */

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

/** Static CSP — same for every request so Vercel can cache ISR responses. */
const CSP =
  process.env.NODE_ENV === "development"
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebase.com https://*.firebaseio.com https://*.cloudfunctions.net",
        "frame-src 'self' https://accounts.google.com",
        "media-src 'self' https: blob:",
        "worker-src 'self' blob:",
      ].join("; ")
    : [
        "default-src 'self'",
        "script-src 'self' 'strict-dynamic' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebase.com https://*.firebaseio.com https://*.cloudfunctions.net",
        "frame-src 'self' https://accounts.google.com",
        "media-src 'self' https: blob:",
        "worker-src 'self' blob:",
      ].join("; ");

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request) ?? NextResponse.next();
  response.headers.set("Content-Security-Policy", CSP);
  return response;
}

export const config = {
  // next-intl matcher: skip Next.js internals, static files, and API routes
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
