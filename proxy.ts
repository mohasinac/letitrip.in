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

const API_PATH_PREFIX = "/api";
const CORS_ALLOW_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const CORS_ALLOW_HEADERS =
  "Content-Type,Authorization,X-Requested-With,X-CSRF-Token";
const CORS_MAX_AGE_SECONDS = "86400";

function normalizeEnvList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const ALLOWED_CORS_ORIGINS = Array.from(
  new Set(
    [
      ...normalizeEnvList(process.env.CORS_ALLOWED_ORIGINS),
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

function appendVary(headers: Headers, value: string): void {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", value);
    return;
  }

  const parts = existing
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.includes(value)) {
    headers.set("Vary", `${existing}, ${value}`);
  }
}

function isApiRequest(request: NextRequest): boolean {
  return request.nextUrl.pathname.startsWith(API_PATH_PREFIX);
}

function getAllowedCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  return ALLOWED_CORS_ORIGINS.includes(origin) ? origin : null;
}

function applyCorsHeaders(
  response: NextResponse,
  allowedOrigin: string | null,
): NextResponse {
  response.headers.set("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
  response.headers.set("Access-Control-Max-Age", CORS_MAX_AGE_SECONDS);
  appendVary(response.headers, "Origin");
  appendVary(response.headers, "Access-Control-Request-Method");
  appendVary(response.headers, "Access-Control-Request-Headers");

  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

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
  if (isApiRequest(request)) {
    const allowedOrigin = getAllowedCorsOrigin(request);

    if (request.method === "OPTIONS") {
      if (request.headers.get("origin") && !allowedOrigin) {
        return new NextResponse(null, { status: 403 });
      }

      return applyCorsHeaders(
        new NextResponse(null, { status: 204 }),
        allowedOrigin,
      );
    }

    return applyCorsHeaders(NextResponse.next(), allowedOrigin);
  }

  const response = intlMiddleware(request) ?? NextResponse.next();
  response.headers.set("Content-Security-Policy", CSP);
  return response;
}

export const config = {
  // Match both page and API routes while skipping Next.js internals and static files.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
