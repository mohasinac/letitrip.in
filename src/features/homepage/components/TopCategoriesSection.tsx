"use client";

import { useTranslations } from "next-intl";
import { useTopCategories } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { CategoryCard } from "@/features/categories";
import { SectionCarousel } from "./SectionCarousel";

export function TopCategoriesSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useTopCategories(12);

  const categories = data || [];

  if (!isLoading && categories.length === 0) return null;

  return (
    <SectionCarousel
      title={t("categoriesTitle")}
      viewMoreHref={ROUTES.PUBLIC.CATEGORIES}
      viewMoreLabel={tActions("viewAllArrow")}
      items={categories.slice(0, 12)}
      renderItem={(category) => <CategoryCard category={category} />}
      perView={{ base: 2, sm: 3, md: 4, xl: 5 }}
      gap={12}
      autoScroll={false}
      keyExtractor={(c) => c.id ?? c.slug}
      isLoading={isLoading}
      skeletonCount={8}
      className={THEME_CONSTANTS.sectionBg.cool}
    />
  );
}
