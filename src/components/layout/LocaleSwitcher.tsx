"use client";

/**
 * LocaleSwitcher
 *
 * Uses the generic DynamicSelect with portal-based positioning so the
 * dropdown is never clipped even when rendered at the bottom of the sidebar.
 *
 * @example
 * ```tsx
 * <LocaleSwitcher />
 * ```
 */

import {
  LocaleSwitcher as AppkitLocaleSwitcher,
  type LocaleSwitcherOption,
} from "@mohasinac/appkit/features/layout";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const options: LocaleSwitcherOption[] = routing.locales.map((loc) => ({
    value: loc,
    label: t(loc as Locale),
  }));

  function handleChange(next: string) {
    if (next && next !== locale) {
      router.replace(pathname, { locale: next as Locale });
    }
  }

  return (
    <AppkitLocaleSwitcher
      locale={locale}
      onChange={handleChange}
      options={options}
      ariaLabel={t("switchTo")}
    />
  );
}
