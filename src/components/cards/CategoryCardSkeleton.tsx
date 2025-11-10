"use client";

import React from "react";

export interface CategoryCardSkeletonProps {
  variant?: "default" | "compact" | "large";
}

export const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({
  variant = "default",
}) => {
  const sizeClasses = {
    compact: "aspect-square",
    default: "aspect-[4/3]",
    large: "aspect-[16/9]",
  };

  return (
    <div className="block bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className={`relative ${sizeClasses[variant]} bg-gray-200`} />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Parent Category Skeleton */}
        {variant !== "compact" && (
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-1" />
        )}

        {/* Category Name Skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          {variant === "large" && (
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          )}
        </div>

        {/* Description Skeleton */}
        {variant === "large" && (
          <div className="space-y-2 mb-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
          </div>
        )}

        {/* Stats Skeleton */}
        {variant !== "compact" && (
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        )}
      </div>
    </div>
  );
};
