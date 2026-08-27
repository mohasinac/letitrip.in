import { normalizeError } from "@mohasinac/appkit";
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

// ── disabledRoutes gate ──────────────────────────────────────────────────────
//
// This check used to live in `src/app/[locale]/layout.tsx`, where it read the
// request path from `x-invoke-path` / `x-pathname`. **Nothing has ever set
// either header** — `x-invoke-path` is a Next 12/13 internal that Next 16 no
// longer emits, and `x-pathname` is not a Next header at all. So the check never
// ran, and the whole admin capability (disable a nav item → that route 404s) was
// silently dead.
//
// Worse, reading it cost the entire site its cacheability: `headers()` is a
// dynamic API, and calling it in the ROOT locale layout opted every page into
// dynamic rendering. Every request — including every crawler hit — paid a full
// cold render at `no-store`, and the `export const revalidate = 120` those pages
// declare was silently overridden.
//
// The proxy is the correct home: it already runs per-request and has
// `request.nextUrl.pathname` natively, so no dynamic API is needed anywhere.
//
// Two constraints shape the implementation:
//   1. Edge runtime — no firebase-admin, so the list comes from the PUBLIC
//      settings endpoint (`disabledRoutes` is in PUBLIC_SITE_SETTINGS_FIELDS,
//      annotated for exactly this use). `/api/...` is excluded from the matcher
//      below, so this cannot recurse.
//   2. It must FAIL OPEN. A settings fetch that errors or times out must never
//      404 a working page — that would turn a transient blip into a site-wide
//      outage, which is strictly worse than the feature not firing.
const DISABLED_ROUTES_TTL_MS = 60_000;
const DISABLED_ROUTES_TIMEOUT_MS = 1_000;
// Tier-2 prefixes own their own RBAC gating and are never nav-disabled.
const DISABLED_ROUTES_EXEMPT = ["/admin", "/store", "/user", "/checkout"];

// Module scope: Edge instances are reused across requests, so this is ~1 fetch
// per instance per minute, not one per request.
let disabledRoutesCache: { at: number; routes: string[] } | null = null;

/** The only part of GET /api/site-settings this gate reads. */
interface SiteSettingsResponse {
  data?: { disabledRoutes?: string[] };
}

async function readDisabledRoutes(origin: string): Promise<string[]> {
  const now = Date.now();
  if (disabledRoutesCache && now - disabledRoutesCache.at < DISABLED_ROUTES_TTL_MS) {
    return disabledRoutesCache.routes;
  }
  try {
    const res = await fetch(`${origin}/api/site-settings`, {
      signal: AbortSignal.timeout(DISABLED_ROUTES_TIMEOUT_MS),
    });
    if (!res.ok) return disabledRoutesCache?.routes ?? [];
    const body = (await res.json()) as SiteSettingsResponse | null;
    const raw = body?.data?.disabledRoutes;
    // Validate at runtime regardless of the asserted shape — this is an external
    // response, and a malformed one must fail open, not throw.
    const routes = Array.isArray(raw) ? raw.filter((r): r is string => typeof r === "string") : [];
    disabledRoutesCache = { at: now, routes };
    return routes;
  } catch (err) {
    void normalizeError(err);
    // Serve stale if we have it, otherwise allow everything. Fail open.
    return disabledRoutesCache?.routes ?? [];
  }
}

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
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

    // ── disabledRoutes gate ────────────────────────────────────────────────
    const localePath = stripLocale(pathname) || "/";
    if (!DISABLED_ROUTES_EXEMPT.some((t) => localePath.startsWith(t))) {
      const disabled = await readDisabledRoutes(request.nextUrl.origin);
      if (disabled.some((r) => localePath === r || localePath.startsWith(`${r}/`))) {
        // Rewrite (not redirect) to an unmatched path INSIDE the [locale]
        // segment. An unmatched route under [locale] renders
        // `src/app/[locale]/not-found.tsx` with a real 404 status, and a rewrite
        // keeps the user's original URL in the address bar.
        //
        // The locale prefix is required: this response bypasses intlMiddleware,
        // so a bare `/not-found` would never reach the [locale] segment and
        // would not render that page. `/not-found` is also not a routable path —
        // `not-found.tsx` is a Next convention file, not a route.
        return NextResponse.rewrite(
          new URL(`/${routing.defaultLocale}/__route-disabled`, request.url),
        );
      }
    }

    // ── next-intl locale proxy ─────────────────────────────────────────────
    return intlMiddleware(request);
  } catch (error) {
    void normalizeError(error);
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
  // `media` must be excluded alongside `api`/`_next`/`_vercel` — `/media/<slug>`
  // is rewritten to `/api/media/:path*` by next.config.js's rewrites(), but
  // that rewrite only runs AFTER this middleware. Without the exclusion here,
  // every `/media/<slug>` request (extensionless by design — the short-ID
  // scheme intentionally hides the real file extension, so the `.*\\..*`
  // dotted-path exclusion never catches it either) got locale-prefixed to
  // `/en/media/<slug>` by next-intl BEFORE the media rewrite ever applied,
  // which 404'd against the app router instead of reaching the media proxy —
  // every image on the site was affected. Confirmed via x-middleware-rewrite
  // response header showing the unwanted /en/ prefix. 2026-08-17.
  matcher: [
    "/((?!api|media|_next|_vercel|.*\\..*).*)",
  ],
};
