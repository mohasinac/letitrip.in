/**
 * AuctionCardSkeleton Component
 *
 * Loading skeleton for AuctionCard
 */

import React from "react";

export const AuctionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Shop Info Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>

        {/* Name Skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>

        {/* Current Bid Skeleton */}
        <div className="mb-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>

        {/* Time Remaining Skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3" />

        {/* Button Skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
      </div>
    </div>
  );
};
