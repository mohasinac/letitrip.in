/**
 * next-intl Locale Middleware
 *
 * Detects the user's preferred locale and rewrites URLs accordingly.
 * - Default locale (English) uses no URL prefix: /products
 * - Other locales use a prefix: /hi/products
 *
 * The matcher excludes:
 * - Next.js internals (_next, _vercel)
 * - Static assets (files with an extension: .png, .svg, .ico, etc.)
 * - API routes (/api/*)
 * - Service worker (/sw.js, /icons/*)
 */

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Next.js internals (_next, _vercel)
    // - Static files (anything with a file extension like .png, .ico, .svg)
    // - Service worker and PWA assets
    "/((?!api|_next|_vercel|sw\\.js|icons|.*\\..*).*)",
  ],
};
