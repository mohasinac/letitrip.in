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
import { routing } from "./routing";

export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing);

