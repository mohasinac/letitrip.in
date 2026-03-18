/**
 * next-intl Server-Side Request Configuration
 *
 * Resolves the locale and loads the appropriate message file for each request.
 * This file is referenced in next.config.js via createNextIntlPlugin.
 */

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { setupZodErrorMap } from "@/lib/zod-error-map";
import { mergeFeatureMessages } from "@mohasinac/cli/i18n";
import features from "@/features.config";

export default getRequestConfig(async ({ requestLocale }) => {
  // Apply custom Zod error messages on every server request (idempotent)
  setupZodErrorMap();

  // Determine the locale from the request (set by middleware or [locale] segment)
  const requested = await requestLocale;

  // Fall back to default locale if the requested locale is not supported
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const projectMessages = (await import(`../../messages/${locale}.json`))
    .default;
  const featureMessages = await mergeFeatureMessages(locale, features);

  return {
    locale,
    messages: { ...featureMessages, ...projectMessages },
  };
});
