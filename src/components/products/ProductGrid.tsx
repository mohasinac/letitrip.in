"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { ProductCard } from "./ProductCard";
import type { ProductDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

type ProductCardData = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
>;

interface ProductGridProps {
  products: ProductCardData[];
  loading?: boolean;
  skeletonCount?: number;
}

function ProductSkeleton() {
  return (
    <div
      className={`${themed.bgPrimary} rounded-lg overflow-hidden animate-pulse`}
    >
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 24,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl mb-4">🔍</span>
        <h3 className={`text-xl font-semibold mb-2 ${themed.textPrimary}`}>
          {UI_LABELS.PRODUCTS_PAGE.NO_PRODUCTS}
        </h3>
        <p className={`text-sm ${themed.textSecondary}`}>
          {UI_LABELS.PRODUCTS_PAGE.NO_PRODUCTS_SUBTITLE}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
