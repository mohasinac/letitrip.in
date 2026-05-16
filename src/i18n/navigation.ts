/**
 * Locale-aware navigation utilities (next-intl)
 *
 * Re-exports `Link`, `redirect`, `useRouter`, and `usePathname` with
 * automatic locale prefix handling based on `src/i18n/routing.ts`.
 *
 * Import from here instead of `next/navigation` whenever you need a
 * component or hook that must stay locale-aware.
 *
 * Usage:
 *   import { Link, useRouter, usePathname } from '@/i18n/navigation';
 */

import { createNavigation } from "next-intl/navigation";
import { notFound } from "next/navigation";
import { routing } from "./routing";

const {
  Link,
  redirect: _redirect,
  useRouter,
  usePathname,
  getPathname,
} = createNavigation(routing);

export { Link, useRouter, usePathname, getPathname, notFound };

/**
 * Redirect to a plain path string. Locale is always "en" (single-locale project).
 * Accepts a plain string so call sites don't need to thread locale through.
 */
export function redirect(href: string): never {
  return _redirect({ href, locale: routing.defaultLocale });
}

