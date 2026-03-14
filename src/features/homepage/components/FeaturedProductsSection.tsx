"use client";

import { useTranslations } from "next-intl";
import { useFeaturedProducts } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { ProductCard } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function FeaturedProductsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedProducts();

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
