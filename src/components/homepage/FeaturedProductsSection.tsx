"use client";

import Link from "next/link";
import Image from "next/image";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS, ROUTES, UI_LABELS } from "@/constants";
import { formatCurrency } from "@/utils";
import { apiClient } from "@/lib/api-client";
import type { ProductDocument } from "@/db/schema";

export function FeaturedProductsSection() {
  const { data, isLoading } = useApiQuery<ProductDocument[]>({
    queryKey: ["products", "featured"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?isPromoted=true&status=published&limit=18`,
      ),
  });

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

  const products = data || [];

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
              {UI_LABELS.HOMEPAGE.FEATURED_PRODUCTS.TITLE}
            </h2>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {UI_LABELS.HOMEPAGE.FEATURED_PRODUCTS.SUBTITLE}
            </p>
          </div>
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className={`text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hidden sm:block`}
          >
            {UI_LABELS.ACTIONS.VIEW_ALL_ARROW}
          </Link>
        </div>

        {/* Mobile: horizontal snap-scroll carousel */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden scrollbar-none">
          {products.slice(0, 18).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={`group flex-none w-40 snap-start ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
            >
              <ProductCardContent product={product} sizes="160px" />
            </Link>
          ))}
        </div>

        {/* Desktop: 2-row grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {products.slice(0, 10).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={`group ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
            >
              <ProductCardContent
                product={product}
                sizes="(max-width: 1024px) 33vw, 20vw"
              />
            </Link>
          ))}
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
          >
            {UI_LABELS.ACTIONS.VIEW_ALL_ARROW}
          </Link>
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
