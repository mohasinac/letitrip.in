/**
 * next-intl Proxy — with crash-safe error handling
 *
 * Intercepts every non-asset, non-API request and:
 * 1. Detects the user's locale from the Accept-Language header / cookie / URL prefix.
 * 2. Redirects/rewrites the URL to include the correct locale prefix where needed.
 * 3. Sets the locale on the request so getLocale() / getMessages() work in server components.
 *
 * If the proxy itself throws (e.g. bad locale data, corrupted cookies, next-intl
 * internal error), the catch block logs the error and redirects to a static
 * `/error.html` that lives in /public — completely independent of the app framework.
 * Because `/error.html` has a file extension, it is excluded by the matcher and
 * will never re-enter the proxy, so redirect loops are impossible.
 *
 * Must be at src/proxy.ts (Next.js 16 discovers it automatically).
 */

import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** The next-intl locale proxy — created once, reused per request. */
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  try {
    return intlMiddleware(request);
  } catch (error) {
    // ---- Log the crash (Edge-compatible — no file I/O) ----
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(
      "[middleware] Unhandled error — redirecting to static error page",
      {
        message: err.message,
        stack: err.stack,
        url: request.nextUrl.pathname,
        method: request.method,
        timestamp: new Date().toISOString(),
      },
    );

    // ---- Redirect to /error.html (static, outside middleware matcher) ----
    const errorUrl = new URL("/error.html", request.url);
    errorUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(errorUrl, { status: 302 });
  }
}

export const config = {
  /**
   * Match all request paths EXCEPT:
   * - Next.js internals (_next/static, _next/image)
   * - Public folder assets (favicon.svg, sw.js, manifest, images, icons…)
   * - API routes  (/api/…)
   */
  matcher: [
    /*
     * Match all pathnames except:
     *   - /api (API routes)
     *   - /_next (Next.js internals)
     *   - /…. (hidden files / dot-prefixed paths)
     *   - files with an extension (e.g. .svg, .png, .ico, .webp, .js, .css)
     */
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
