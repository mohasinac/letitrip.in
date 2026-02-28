"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useFeaturedProducts } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";
import { HorizontalScroller } from "@/components/ui";

export function FeaturedProductsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className="w-full">
          <div
            className={`h-8 ${THEME_CONSTANTS.skeleton.base} mb-8 max-w-xs`}
          />
          {/* Mobile: horizontal scroll skeleton */}
          <div className="flex gap-3 overflow-hidden md:hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-none w-40 space-y-2">
                <div
                  className={`aspect-square ${THEME_CONSTANTS.skeleton.image}`}
                />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-3/4`} />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-1/2`} />
              </div>
            ))}
          </div>
          {/* Desktop: grid skeleton */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div
                  className={`aspect-square ${THEME_CONSTANTS.skeleton.image}`}
                />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-3/4`} />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-1/2`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const products = data?.items || [];

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-1`}
            >
              {t("featuredProducts")}
            </h2>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {t("featuredProductsSubtitle")}
            </p>
          </div>
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className={`text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300`}
          >
            {tActions("viewAllArrow")}
          </Link>
        </div>

        {/* Mobile: single-row circular carousel */}
        <div className="md:hidden">
          <HorizontalScroller
            items={products.slice(0, 20)}
            renderItem={(product) => (
              <Link
                href={`/products/${product.id}`}
                className={`group block ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
              >
                <ProductCardContent product={product} sizes="160px" />
              </Link>
            )}
            itemWidth={160}
            gap={12}
            autoScroll
            keyExtractor={(p) => p.id}
            className="px-5"
          />
        </div>

        {/* Desktop: 3-row grid scroller with visible scrollbar */}
        <div className="hidden md:block">
          <HorizontalScroller
            items={products.slice(0, 30)}
            renderItem={(product) => (
              <Link
                href={`/products/${product.id}`}
                className={`group block ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
              >
                <ProductCardContent
                  product={product}
                  sizes="(max-width: 1280px) 20vw, 160px"
                />
              </Link>
            )}
            itemWidth={160}
            rows={3}
            gap={12}
            showScrollbar
            keyExtractor={(p) => p.id}
            className="px-5 pb-1"
          />
        </div>
      </div>
    </section>
  );
}

function ProductCardContent({
  product,
  sizes,
}: {
  product: ProductDocument;
  sizes: string;
}) {
  return (
    <>
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.mainImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes={sizes}
        />
        {product.isPromoted && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>
      <div className={`${THEME_CONSTANTS.spacing.padding.sm} text-left`}>
        {product.brand && (
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
          >
            {product.brand}
          </p>
        )}
        <h3
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-2 line-clamp-2 min-h-[2.5rem]`}
        >
          {product.title}
        </h3>
        <p
          className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} font-bold`}
        >
          {formatCurrency(product.price, product.currency)}
        </p>
      </div>
    </>
  );
}
