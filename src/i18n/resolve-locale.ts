import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

/**
 * Coerces any incoming locale-like value to a supported locale.
 * Falls back to routing.defaultLocale when value is missing or invalid.
 */
export function resolveLocale(locale: string | undefined): string {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
