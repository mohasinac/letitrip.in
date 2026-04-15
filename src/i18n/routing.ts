/**
 * i18n Routing Configuration
 *
 * Defines supported locales and routing strategy for next-intl.
 * - Default locale ('en') uses no URL prefix (e.g. /products)
 * - Additional locales get a URL prefix (e.g. /hi/products)
 *
 * To add a new locale:
 * 1. Add it to the `locales` array below
 * 2. Create messages/<locale>.json
 * 3. Add translations for all keys
 */

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en"] as const,
  defaultLocale: "en",
  localePrefix: "never",
  // Disable locale cookie — it sets Set-Cookie on every response which forces
  // cache-control: private, no-store and prevents Vercel ISR caching entirely.
  // Since we only have one locale (en), the cookie is unnecessary.
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];

