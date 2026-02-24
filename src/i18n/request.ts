/**
 * next-intl Server-Side Request Configuration
 *
 * Resolves the locale and loads the appropriate message file for each request.
 * This file is referenced in next.config.js via createNextIntlPlugin.
 */

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Determine the locale from the request (set by middleware or [locale] segment)
  const requested = await requestLocale;

  // Fall back to default locale if the requested locale is not supported
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Dynamically import the message file for the resolved locale
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
