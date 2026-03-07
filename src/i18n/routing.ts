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
  /** Supported locales — en (English), in (Hindi), mh (Marathi), ts (Telugu), tn (Tamil) */
  locales: ["en", "in", "mh", "ts", "tn"] as const,

  /** Default locale — English pages have no URL prefix */
  defaultLocale: "en",

  /**
   * 'as-needed': default locale (/en) has no prefix, others (/hi) have prefix.
   * Change to 'always' to force all locales to show a prefix (e.g. /en/products).
   */
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
