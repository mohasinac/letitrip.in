/**
 * Unified Skeleton Component
 * Loading placeholders with animation
 * Multiple variants and shapes
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface UnifiedSkeletonProps {
  // Variant
  variant?: "text" | "circular" | "rectangular" | "rounded";

  // Dimensions
  width?: string | number;
  height?: string | number;

  // Animation
  animation?: "pulse" | "wave" | "none";

  // Count (for multiple skeletons)
  count?: number;

  // HTML
  className?: string;
}

export const UnifiedSkeleton: React.FC<UnifiedSkeletonProps> = ({
  variant = "text",
  width,
  height,
  animation = "pulse",
  count = 1,
  className,
}) => {
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {
    width: width
      ? typeof width === "number"
        ? `${width}px`
        : width
      : undefined,
    height: height
      ? typeof height === "number"
        ? `${height}px`
        : height
      : undefined,
  };

  const skeletonElement = (
    <div
      className={cn(
        "bg-surfaceVariant",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-live="polite"
      aria-busy="true"
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2 last:mb-0">
          {skeletonElement}
        </div>
      ))}
    </>
  );
};

// ============================================================================
// SKELETON PRESETS
// ============================================================================

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <UnifiedSkeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? "70%" : "100%"}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className }) => (
  <UnifiedSkeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "bg-surface rounded-lg border-2 border-border p-6",
      className
    )}
  >
    <UnifiedSkeleton variant="rounded" height={200} className="mb-4" />
    <UnifiedSkeleton variant="text" width="60%" className="mb-2" />
    <UnifiedSkeleton variant="text" width="80%" className="mb-4" />
    <div className="flex justify-between">
      <UnifiedSkeleton variant="text" width={100} />
      <UnifiedSkeleton variant="text" width={80} />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className,
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center gap-4">
        <SkeletonAvatar size={48} />
        <div className="flex-1 space-y-2">
          <UnifiedSkeleton variant="text" width="40%" />
          <UnifiedSkeleton variant="text" width="60%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn("space-y-2", className)}>
    {/* Header */}
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <UnifiedSkeleton key={index} variant="text" height={40} />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <UnifiedSkeleton key={colIndex} variant="text" height={40} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonProductCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "bg-surface rounded-lg border-2 border-border overflow-hidden",
      className
    )}
  >
    <UnifiedSkeleton variant="rectangular" height={200} />
    <div className="p-4 space-y-3">
      <UnifiedSkeleton variant="text" width="80%" />
      <UnifiedSkeleton variant="text" width="60%" />
      <div className="flex justify-between items-center pt-2">
        <UnifiedSkeleton variant="text" width={80} height={24} />
        <UnifiedSkeleton variant="rounded" width={100} height={36} />
      </div>
    </div>
  </div>
);

export default UnifiedSkeleton;
