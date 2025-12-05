/**
 * @fileoverview React Component
 * @module src/components/common/skeletons/AuctionCardSkeleton
 * @description This file contains the AuctionCardSkeleton component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import {
  Skeleton,
  SkeletonImage,
  SkeletonText,
  SkeletonButton,
} from "../Skeleton";
import { cn } from "@/lib/utils";

/**
 * AuctionCardSkeletonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AuctionCardSkeletonProps
 */
interface AuctionCardSkeletonProps {
  /** Class Name */
  className?: string;
}

/**
 * Skeleton loader for AuctionCard component
 * Matches the layout of the actual AuctionCard
 */
/**
 * Performs auction card skeleton operation
 *
 * @param {AuctionCardSkeletonProps} { className } - The { class name }
 *
 * @returns {any} The auctioncardskeleton result
 *
 * @example
 * AuctionCardSkeleton({ className });
 */

/**
 * Performs auction card skeleton operation
 *
 * @param {AuctionCardSkeletonProps} { className } - The { class name }
 *
 * @returns {any} The auctioncardskeleton result
 *
 * @example
 * AuctionCardSkeleton({ className });
 */

export function AuctionCardSkeleton({ className }: AuctionCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className,
      )}
    >
      {/* Auction Image/Video */}
      <div className="relative">
        <SkeletonImage aspectRatio="video" className="rounded-none" />

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Auction Title */}
        <Skeleton className="h-6 w-full" />

        {/* Description */}
        <SkeletonText lines={2} />

        {/* Bid Information */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100">
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Shop Info */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
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
 * Grid of AuctionCard skeletons
 */
/**
 * Performs auction card skeleton grid operation
 *
 * @returns {number} The auctioncardskeletongrid result
 *
 * @example
 * AuctionCardSkeletonGrid();
 */

/**
 * Performs auction card skeleton grid operation
 *
 * @returns {any} The auctioncardskeletongrid result
 *
 * @example
 * AuctionCardSkeletonGrid();
 */

export function AuctionCardSkeletonGrid({
  count = 8,
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
        <AuctionCardSkeleton key={i} />
      ))}
    </div>
  );
}
