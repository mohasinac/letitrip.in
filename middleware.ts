/**
 * Next.js Middleware
 *
 * Responsibilities:
 * 1. Locale routing via next-intl (redirect /products → /en/products etc.)
 * 2. Per-request CSP nonce injection — removes `unsafe-eval` in production
 *
 * The nonce is generated here, placed in:
 *   - `Content-Security-Policy` response header
 *   - `x-nonce` request header (so server components can read it via `headers()`)
 */

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";
import { generateNonce, buildCSP } from "./src/lib/security/csp";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCSP(nonce);

  // Clone request headers and inject nonce so layout can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Run next-intl locale routing first
  const intlResponse = intlMiddleware(
    new NextRequest(request.url, {
      headers: requestHeaders,
      method: request.method,
      body: request.body,
    }),
  );

  const response =
    intlResponse ?? NextResponse.next({ request: { headers: requestHeaders } });

  // Attach CSP to the response
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  // next-intl matcher: skip Next.js internals, static files, and API routes
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
