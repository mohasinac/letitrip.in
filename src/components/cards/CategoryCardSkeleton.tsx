/**
 * @fileoverview React Component
 * @module src/components/cards/CategoryCardSkeleton
 * @description This file contains the CategoryCardSkeleton component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React from "react";

/**
 * CategoryCardSkeletonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryCardSkeletonProps
 */
export interface CategoryCardSkeletonProps {
  /** Variant */
  variant?: "default" | "compact" | "large";
}

/**
 * Performs category card skeleton operation
 *
 * @param {string} [{
  variant] - The {
  variant
 *
 * @returns {any} The categorycardskeleton result
 *
 * @example
 * CategoryCardSkeleton("example");
 */

/**
 * C
 * @constant
 */
/**
 * Performs category card skeleton operation
 *
 * @param {string} [{
  variant] - The {
  variant
 *
 * @returns {any} The categorycardskeleton result
 *
 * @example
 * CategoryCardSkeleton("example");
 */

/**
 * C
 * @constant
 */
export const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({
  variant = "default",
}) => {
  const sizeClasses = {
    /** Compact */
    compact: "aspect-square",
    /** Default */
    default: "aspect-[4/3]",
    /** Large */
    large: "aspect-[16/9]",
  };

  return (
    <div className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div
        className={`relative ${sizeClasses[variant]} bg-gray-200 dark:bg-gray-700`}
      />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Parent Category Skeleton */}
        {variant !== "compact" && (
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1" />
        )}

        {/* Category Name Skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          {variant === "large" && (
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          )}
        </div>

        {/* Description Skeleton */}
        {variant === "large" && (
          <div className="space-y-2 mb-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
          </div>
        )}

        {/* Stats Skeleton */}
        {variant !== "compact" && (
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        )}
      </div>
    </div>
  );
};
