/**
 * next-intl Server-Side Request Configuration
 *
 * Resolves the locale and loads the appropriate message file for each request.
 * This file is referenced in next.config.js via createNextIntlPlugin.
 */

const { hasLocale } = require("next-intl");
const { getRequestConfig } = require("next-intl/server");
// const { setupZodErrorMap } = require("@mohasinac/appkit");
const { routing } = require("./routing");
// const { mergeFeatureMessages } = require("@mohasinac/appkit");
const features = require("../features.config");
const { LOCALE_CONFIG } = require("../constants");

module.exports = getRequestConfig(async ({ requestLocale }) => {
  // Apply custom Zod error messages on every server request (idempotent)
  // setupZodErrorMap();

  // Determine the locale from the request (set by middleware or [locale] segment).
  // With localePrefix:"never" and localeCookie:false, requestLocale may be
  // undefined during ISR revalidation or static pre-render — always fall back
  // to "en" so next-intl never receives an undefined locale.
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : "en";

  const projectMessages = (await import(`../../messages/${locale}.json`))
    .default;
  // const featureMessages = await mergeFeatureMessages(locale, features);

  return {
    locale,
    messages: { ...projectMessages },
    timeZone: LOCALE_CONFIG.TIMEZONE,
    now: new Date(),
  };
});

