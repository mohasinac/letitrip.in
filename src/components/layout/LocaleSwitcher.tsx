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

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { DynamicSelect } from "@/components";
import type { DynamicSelectOption } from "@/components";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const options: DynamicSelectOption<Locale>[] = routing.locales.map((loc) => ({
    value: loc as Locale,
    label: t(loc as Locale),
  }));

  function handleChange(next: Locale | null) {
    if (next && next !== locale) {
      router.replace(pathname, { locale: next });
    }
  }

  return (
    <DynamicSelect<Locale>
      value={locale}
      onChange={handleChange}
      options={options}
      ariaLabel={t("switchTo")}
      searchPlaceholder={t("search")}
      noResultsText={t("noResults")}
      placement="auto"
    />
  );
}
