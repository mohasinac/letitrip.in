/**
 * next-intl Server-Side Request Configuration
 *
 * Resolves the locale and loads the appropriate message file for each request.
 * This file is referenced in next.config.js via createNextIntlPlugin.
 */

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { setupZodErrorMap } from "@mohasinac/appkit";
import { routing } from "./routing";
import { mergeFeatureMessages } from "@mohasinac/appkit";
import features from "@/features.config";
import { LOCALE_CONFIG } from "@/constants";

export default getRequestConfig(async ({ requestLocale }) => {
  // Apply custom Zod error messages on every server request (idempotent)
  setupZodErrorMap();

  // Determine the locale from the request (set by middleware or [locale] segment).
  // With localePrefix:"never" and localeCookie:false, requestLocale may be
  // undefined during ISR revalidation or static pre-render — always fall back
  // to "en" so next-intl never receives an undefined locale.
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : "en";

  const projectMessages = (await import(`../../messages/${locale}.json`))
    .default;
  const featureMessages = await mergeFeatureMessages(locale, features);

  return {
    locale,
    messages: { ...featureMessages, ...projectMessages },
    timeZone: LOCALE_CONFIG.TIMEZONE,
    now: new Date(),
  };
});

