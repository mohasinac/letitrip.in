/**
 * next-intl Proxy — with crash-safe error handling + RBAC first gate
 *
 * Intercepts every non-asset, non-API request and:
 * 1. Detects the user's locale from the Accept-Language header / cookie / URL prefix.
 * 2. Redirects/rewrites the URL to include the correct locale prefix where needed.
 * 3. Sets the locale on the request so getLocale() / getMessages() work in server components.
 * 4. (RBAC10) For /admin/* routes: decodes the session cookie JWT payload and
 *    redirects non-admin / non-employee users to /unauthorized before the page renders.
 *    This is a cheap first gate — the RSC layouts (RBAC3/RBAC4) do the full
 *    per-section permission check. No Firestore read here (Edge-safe).
 *
 * If the proxy itself throws, the catch block redirects to a static /error.html.
 *
 * Must be at src/proxy.ts (Next.js 16 discovers it automatically).
 */

import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { decodeEdgeSessionRole, readEdgeSessionCookie } from "@/lib/edge/session-role";

/** The next-intl locale proxy — created once, reused per request. */
const intlMiddleware = createMiddleware(routing);

// Routes that never need RBAC gating even under /admin or /store
const RBAC_BYPASS = new Set(["/unauthorized", "/error.html", "/auth/login"]);

export default function middleware(request: NextRequest): NextResponse {
  try {
    const { pathname } = request.nextUrl;

    // ── RBAC first gate ────────────────────────────────────────────────────
    if (
      pathname.startsWith("/admin") &&
      !RBAC_BYPASS.has(pathname)
    ) {
      const role = decodeEdgeSessionRole(readEdgeSessionCookie(request));

      if (role !== "admin" && role !== "employee") {
        const target = role
          ? new URL("/unauthorized", request.url)
          : new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, request.url);
        return NextResponse.redirect(target, { status: 302 });
      }
    }

    // ── next-intl locale proxy ─────────────────────────────────────────────
    return intlMiddleware(request);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(
      JSON.stringify({
        severity: "ERROR",
        message: "[middleware] Unhandled error — redirecting to static error page",
        error: err.message,
        url: request.nextUrl.pathname,
        method: request.method,
        timestamp: new Date().toISOString(),
      }),
    );

    const errorUrl = new URL("/error.html", request.url);
    errorUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(errorUrl, { status: 302 });
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
