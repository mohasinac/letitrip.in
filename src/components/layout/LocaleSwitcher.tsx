"use client";

/**
 * LocaleSwitcher
 *
 * Compact pill-style toggle that switches between the supported locales
 * (English / Hindi) without a full page reload.
 *
 * Behaviour:
 * - Reads the active locale from next-intl's `useLocale()`
 * - On click, calls `router.replace(pathname, { locale })` from
 *   `@/i18n/navigation` so the URL prefix changes but the current
 *   page stays the same
 * - Inactive locale is shown as a subdued button; active locale is
 *   highlighted in brand colour
 *
 * @example
 * ```tsx
 * <LocaleSwitcher />
 * ```
 */

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { THEME_CONSTANTS } from "@/constants";
import Button from "../ui/Button";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg border ${THEME_CONSTANTS.themed.border} p-0.5`}
      role="group"
      aria-label={t("switchTo")}
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <Button
            key={loc}
            variant="ghost"
            onClick={() => switchLocale(loc as Locale)}
            aria-pressed={isActive}
            title={t(loc as "en" | "hi")}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-150 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : `${THEME_CONSTANTS.themed.textSecondary} hover:text-blue-600 dark:hover:text-blue-400`
            }`}
          >
            {t(loc as "en" | "hi")}
          </Button>
        );
      })}
    </div>
  );
}
