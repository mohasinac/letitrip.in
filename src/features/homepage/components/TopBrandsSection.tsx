"use client";

import { useTranslations } from "next-intl";
import { useTopBrands } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";
import { CategoryCard } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function TopBrandsSection() {
  const t = useTranslations("homepage");
  const { data, isLoading } = useTopBrands(12);

  const brands = data || [];

  if (!isLoading && brands.length === 0) return null;

  return (
    <SectionCarousel
      title={t("brandsTitle")}
      headingVariant="editorial"
      pillLabel={t("brandsPill")}
      items={brands.slice(0, 12)}
      renderItem={(brand) => <CategoryCard category={brand} />}
      perView={{ base: 2, sm: 3, md: 4, xl: 5 }}
      gap={12}
      autoScroll={false}
      keyExtractor={(c) => c.id ?? c.slug}
      isLoading={isLoading}
      skeletonCount={8}
      className="bg-gradient-to-br from-amber-50 to-amber-50/20 dark:from-amber-950/20 dark:to-slate-900"
    />
  );
}
