import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { categoriesRepository } from "@/repositories";
import { SearchView } from "@/features/search";
import type { CategoryDocument } from "@/db/schema";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function SearchPage() {
  const initialCategories = await categoriesRepository
    .findAll()
    .then((cats: CategoryDocument[]) => cats.filter((c) => !c.isBrand))
    .catch(() => [] as CategoryDocument[]);

  return (
    <Suspense>
      <SearchView initialCategories={initialCategories} />
    </Suspense>
  );
}
