/**
 * @fileoverview React Component
 * @module src/components/common/skeletons/ProductCardSkeleton
 * @description This file contains the ProductCardSkeleton component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import {
  Skeleton,
  SkeletonImage,
  SkeletonText,
  SkeletonButton,
} from "../Skeleton";
import { cn } from "@/lib/utils";

/**
 * ProductCardSkeletonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductCardSkeletonProps
 */
interface ProductCardSkeletonProps {
  /** Class Name */
  className?: string;
}

/**
 * Skeleton loader for ProductCard component
 * Matches the layout of the actual ProductCard
 */
/**
 * Performs product card skeleton operation
 *
 * @param {ProductCardSkeletonProps} { className } - The { class name }
 *
 * @returns {any} The productcardskeleton result
 *
 * @example
 * ProductCardSkeleton({ className });
 */

/**
 * Performs product card skeleton operation
 *
 * @param {ProductCardSkeletonProps} { className } - The { class name }
 *
 * @returns {any} The productcardskeleton result
 *
 * @example
 * ProductCardSkeleton({ className });
 */

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className,
      )}
    >
      {/* Product Image */}
      <SkeletonImage aspectRatio="square" className="rounded-none" />

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Product Description */}
        <SkeletonText lines={2} />

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Rating & Shop */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <SkeletonButton className="flex-1" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of ProductCard skeletons
 */
/**
 * Performs product card skeleton grid operation
 *
 * @returns {number} The productcardskeletongrid result
 *
 * @example
 * ProductCardSkeletonGrid();
 */

/**
 * Performs product card skeleton grid operation
 *
 * @returns {any} The productcardskeletongrid result
 *
 * @example
 * ProductCardSkeletonGrid();
 */

export function ProductCardSkeletonGrid({
  count = 12,
  className,
}: {
  /** Count */
  count?: number;
  /** Class Name */
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
