/**
 * Categories Listing Page
 *
 * Route: /categories
 * Displays all active categories as a browse grid.
 * SSR: prefetches flat category list on the server for zero-CLS first paint.
 */

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categoriesRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import { CategoriesListView } from "@/features/categories/components";
import type { CategoryItem } from "@mohasinac/appkit/features/categories";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "categories" });
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    openGraph: {
      title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
      description: t("metaDescription"),
    },
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const initialData = await categoriesRepository
    .findAll()
    .then((cats) => cats.filter((c) => !c.isBrand) as unknown as CategoryItem[])
    .catch(() => [] as CategoryItem[]);

  return <CategoriesListView initialData={initialData} />;
}
