import React from "react";

export interface ProductCardSkeletonProps {
  compact?: boolean;
  showShopName?: boolean;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  compact = false,
  showShopName = true,
}) => {
  return (
    <div className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className={`p-${compact ? "3" : "4"}`}>
        {/* Product Name Skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          {!compact && (
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          )}
        </div>

        {/* Shop Name Skeleton */}
        {showShopName && (
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        )}

        {/* Rating Skeleton */}
        {!compact && (
          <div className="flex items-center gap-1 mb-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          </div>
        )}

        {/* Price Skeleton */}
        <div className="flex items-baseline gap-2">
          <div
            className={`h-${
              compact ? "6" : "7"
            } bg-gray-200 dark:bg-gray-700 rounded w-24`}
          />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
};