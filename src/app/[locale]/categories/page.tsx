/**
 * Categories Listing Page
 *
 * Route: /categories
 * Displays all active categories as a browse grid.
 * SSR: prefetches flat category list on the server for zero-CLS first paint.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { categoriesRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import { CategoriesListView } from "@/features/categories";
import type { CategoryItem } from "@mohasinac/feat-categories";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    openGraph: {
      title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
      description: t("metaDescription"),
    },
  };
}

export default async function CategoriesPage() {
  const initialData = await categoriesRepository
    .findAll()
    .then((cats) => cats.filter((c) => !c.isBrand) as unknown as CategoryItem[])
    .catch(() => [] as CategoryItem[]);

  return <CategoriesListView initialData={initialData} />;
}
