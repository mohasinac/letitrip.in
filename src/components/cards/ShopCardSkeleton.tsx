/**
 * @fileoverview React Component
 * @module src/components/cards/ShopCardSkeleton
 * @description This file contains the ShopCardSkeleton component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React from "react";

/**
 * ShopCardSkeletonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopCardSkeletonProps
 */
export interface ShopCardSkeletonProps {
  /** Show Banner */
  showBanner?: boolean;
  /** Compact */
  compact?: boolean;
}

/**
 * Performs shop card skeleton operation
 *
 * @param {any} [{
  showBanner] - The {
  show banner
 *
 * @returns {any} The shopcardskeleton result
 *
 * @example
 * ShopCardSkeleton({
  showBanner);
 */

/**
 * S
 * @constant
 */
/**
 * Performs shop card skeleton operation
 *
 * @param {any} [{
  showBanner] - The {
  show banner
 *
 * @returns {any} The shopcardskeleton result
 *
 * @example
 * ShopCardSkeleton({
  showBanner);
 */

/**
 * S
 * @constant
 */
export const ShopCardSkeleton: React.FC<ShopCardSkeletonProps> = ({
  showBanner = true,
  compact = false,
}) => {
  return (
    <div className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
      {/* Banner Skeleton */}
      {showBanner && !compact && (
        <div className="relative h-32 bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Content Skeleton */}
      <div
        className={`p-${compact ? "4" : "6"} ${
          showBanner && !compact ? "-mt-12" : ""
        }`}
      >
        {/* Logo & Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo Skeleton */}
          <div
            className={`${
              showBanner && !compact
                ? "border-4 border-white dark:border-gray-700 shadow-lg"
                : "border border-gray-200 dark:border-gray-700"
            } rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-600 ${
              compact ? "w-16 h-16" : "w-20 h-20"
            }`}
          />

          {/* Shop Name & Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>

            {/* Location */}
            {!compact && (
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            )}
          </div>

          {/* Follow Button Skeleton */}
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0" />
        </div>

        {/* Description Skeleton */}
        {!compact && (
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
          </div>
        )}

        {/* Categories Skeleton */}
        {!compact && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-14" />
          </div>
        )}

        {/* Stats Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
};
