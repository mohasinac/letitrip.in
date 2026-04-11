"use client";

import { useTranslations } from "next-intl";
import { useFeaturedProducts } from "@mohasinac/appkit/features/homepage";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { ProductCard } from "@/components";
import type { ProductListResponse } from "@mohasinac/appkit/features/products";
import { SectionCarousel } from "./SectionCarousel";

interface FeaturedProductsSectionProps {
  initialData?: ProductListResponse;
}

export function FeaturedProductsSection({
  initialData,
}: FeaturedProductsSectionProps) {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedProducts({ initialData });

  const products = data?.items ?? [];

  // Hide section entirely when there are no products and not loading
  if (!isLoading && products.length === 0) return null;

  return (
    <SectionCarousel
      title={t("featuredProducts")}
      description={t("featuredProductsSubtitle")}
      headingVariant="gradient"
      viewMoreHref={ROUTES.PUBLIC.PRODUCTS}
      viewMoreLabel={tActions("viewAllArrow")}
      items={products}
      renderItem={(product) => <ProductCard product={product} />}
      perView={{ base: 2, sm: 3, md: 4 }}
      gap={12}
      autoScroll
      autoScrollInterval={3500}
      keyExtractor={(p) => p.id}
      isLoading={isLoading}
      skeletonCount={5}
      className={THEME_CONSTANTS.themed.bgSecondary}
    />
  );
}
