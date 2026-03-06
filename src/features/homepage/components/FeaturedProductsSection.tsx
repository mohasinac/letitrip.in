"use client";

import { useTranslations } from "next-intl";
import { useFeaturedProducts } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";
import { Heading, MediaImage, Span, Text, TextLink } from "@/components";
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
      viewMoreHref={ROUTES.PUBLIC.PRODUCTS}
      viewMoreLabel={tActions("viewAllArrow")}
      items={products}
      renderItem={(product) => (
        <TextLink
          href={`/products/${product.id}`}
          className={`group block ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
        >
          <ProductCardContent product={product} />
        </TextLink>
      )}
      perView={{ base: 2, sm: 3, md: 4, xl: 5, "2xl": 6 }}
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

function ProductCardContent({ product }: { product: ProductDocument }) {
  const t = useTranslations("homepage");
  return (
    <>
      <div className="relative aspect-square overflow-hidden">
        <MediaImage
          src={product.mainImage}
          alt={product.title}
          size="card"
          className="group-hover:scale-110 transition-transform duration-300"
        />
        {product.isPromoted && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            {t("promoted")}
          </div>
        )}
      </div>
      <div className={`${THEME_CONSTANTS.spacing.padding.sm} text-left`}>
        {product.brand && (
          <Text
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
          >
            {product.brand}
          </Text>
        )}
        <Heading
          level={3}
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-2 line-clamp-2 min-h-[2.5rem]`}
        >
          {product.title}
        </Heading>
        <Text
          className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} font-bold`}
        >
          {formatCurrency(product.price, product.currency)}
        </Text>
      </div>
    </>
  );
}
