import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Enable/disable pulse animation
   * @default true
   */
  animate?: boolean;
}

/**
 * cn - Simple class name utility
 * Combines class names, filtering out falsy values
 */
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Skeleton - Base skeleton component for loading states
 *
 * A simple, flexible skeleton component that displays a placeholder while content is loading.
 * Uses Tailwind CSS for styling and animations.
 *
 * Features:
 * - Pulse animation (optional)
 * - Fully customizable via className
 * - Accepts all standard div attributes
 * - Framework-agnostic design
 *
 * @example
 * ```tsx
 * // Simple skeleton
 * <Skeleton className="h-4 w-full" />
 *
 * // Card skeleton
 * <Skeleton className="h-64 w-full rounded-lg" />
 *
 * // Without animation
 * <Skeleton className="h-4 w-24" animate={false} />
 * ```
 */
export function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded",
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonText - Skeleton for text lines
 *
 * Renders multiple skeleton lines simulating text content.
 * The last line is automatically shorter (75% width) for a more realistic appearance.
 *
 * @example
 * ```tsx
 * <SkeletonText lines={3} />
 * <SkeletonText lines={5} className="mt-4" />
 * ```
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full" // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar - Skeleton for avatar/profile picture
 *
 * Circular skeleton optimized for avatar placeholders.
 *
 * @example
 * ```tsx
 * <SkeletonAvatar size="md" />
 * <SkeletonAvatar size="lg" className="mr-4" />
 * ```
 */
export function SkeletonAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

/**
 * SkeletonButton - Skeleton for button
 *
 * Rectangular skeleton optimized for button placeholders.
 *
 * @example
 * ```tsx
 * <SkeletonButton variant="default" />
 * <SkeletonButton variant="lg" className="w-full" />
 * ```
 */
export function SkeletonButton({
  variant = "default",
  className,
}: {
  variant?: "default" | "sm" | "lg";
  className?: string;
}) {
  const variantClasses = {
    default: "h-10 w-24",
    sm: "h-8 w-20",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      className={cn("rounded-lg", variantClasses[variant], className)}
    />
  );
}

/**
 * SkeletonImage - Skeleton for image
 *
 * Skeleton with aspect ratio presets for image placeholders.
 *
 * @example
 * ```tsx
 * <SkeletonImage aspectRatio="video" />
 * <SkeletonImage aspectRatio="square" className="max-w-md" />
 * ```
 */
export function SkeletonImage({
  aspectRatio = "video",
  className,
}: {
  aspectRatio?: "square" | "video" | "portrait";
  className?: string;
}) {
  const ratioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  return (
    <Skeleton
      className={cn("w-full rounded-lg", ratioClasses[aspectRatio], className)}
    />
  );
}

// LoadingSkeleton types and component

export interface LoadingSkeletonProps {
  /**
   * Type of skeleton layout
   * @default "card"
   */
  type?: "card" | "list" | "detail" | "grid" | "table";

  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * LoadingSkeleton - Complex skeleton layouts for different content types
 *
 * Pre-built skeleton layouts optimized for common UI patterns.
 * Provides consistent loading states across the application.
 *
 * Features:
 * - Multiple layout types (card, list, detail, grid, table)
 * - Configurable item count
 * - Dark mode support
 * - Pulse animations
 *
 * @example
 * ```tsx
 * // Card grid loading
 * <LoadingSkeleton type="grid" count={6} />
 *
 * // List loading
 * <LoadingSkeleton type="list" count={3} />
 *
 * // Product detail loading
 * <LoadingSkeleton type="detail" />
 * ```
 */
export function LoadingSkeleton({
  type = "card",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className={cn("animate-pulse", className)}>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* Image skeleton */}
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600" />

              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                <div className="flex items-center justify-between mt-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "list") {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg",
              className
            )}
          >
            {/* Image skeleton */}
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              <div className="flex items-center gap-4 mt-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24" />
              </div>
            </div>

            {/* Action skeleton */}
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32" />
          </div>
        ))}
      </>
    );
  }

  if (type === "detail") {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded"
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
            </div>
            <div className="flex gap-4 mt-8">
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
          className
        )}
      >
        {skeletons.map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                <div className="flex items-center justify-between mt-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        {/* Table header skeleton */}
        <div className="flex gap-4 pb-3 border-b border-gray-300 dark:border-gray-600">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/5" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
        </div>

        {/* Table rows skeleton */}
        {skeletons.map((i) => (
          <div
            key={i}
            className="flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/5" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// Default export for backward compatibility
export default LoadingSkeleton;
