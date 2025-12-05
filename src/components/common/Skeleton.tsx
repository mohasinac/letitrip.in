/**
 * @fileoverview React Component
 * @module src/components/common/Skeleton
 * @description This file contains the Skeleton component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import React from "react";
import { cn } from "@/lib/utils";

/**
 * SkeletonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SkeletonProps
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Class Name */
  className?: string;
  /** Animate */
  animate?: boolean;
}

/**
 * Base Skeleton component for loading states
 *
 * @example
 * // Simple skeleton
 * <Skeleton className="h-4 w-full" />
 *
 * // Card skeleton
 * <Skeleton className="h-64 w-full rounded-lg" />
 *
 * // Without animation
 * <Skeleton className="h-4 w-24" animate={false} />
 */
/**
 * Performs skeleton operation
 *
 * @param {SkeletonProps} [{
  className,
  animate] - The {
  /**
   * Name class
   * @class name
   */
  class name,
  animate
 *
 * @returns {any} The skeleton result
 *
 * @example
 * Skeleton({
  className,
  animate);
 */

/**
 * Performs skeleton operation
 *
 * @param {SkeletonProps} [{
  className,
  animate] - The {
  class name,
  animate
 *
 * @returns {any} The skeleton result
 *
 * @example
 * Skeleton({
  className,
  animate);
 */

/**
 * Performs skeleton operation
 *
 * @param {SkeletonProps} [{
  className,
  animate = true,
  ...props
}] - The {
  classname,
  animate = true,
  ...props
}
 *
 * @returns {any} The skeleton result
 *
 * @example
 * Skeleton({
  className,
  animate = true,
  ...props
});
 */
export function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gray-200 rounded",
        animate && "animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for text lines
 */
/**
 * Performs skeleton text operation
 *
 * @returns {number} The skeletontext result
 *
 * @example
 * SkeletonText();
 */

/**
 * Performs skeleton text operation
 *
 * @returns {any} The skeletontext result
 *
 * @example
 * SkeletonText();
 */

export function SkeletonText({
  lines = 3,
  className,
}: {
  /** Lines */
  lines?: number;
  /** Class Name */
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full", // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for avatar/profile picture
 */
/**
 * Performs skeleton avatar operation
 *
 * @returns {any} The skeletonavatar result
 *
 * @example
 * SkeletonAvatar();
 */

/**
 * Performs skeleton avatar operation
 *
 * @returns {any} The skeletonavatar result
 *
 * @example
 * SkeletonAvatar();
 */

export function SkeletonAvatar({
  size = "md",
  className,
}: {
  /** Size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Class Name */
  className?: string;
}) {
  const sizeClasses = {
    /** Sm */
    sm: "h-8 w-8",
    /** Md */
    md: "h-12 w-12",
    /** Lg */
    lg: "h-16 w-16",
    /** Xl */
    xl: "h-24 w-24",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

/**
 * Skeleton for button
 */
/**
 * Performs skeleton button operation
 *
 * @returns {any} The skeletonbutton result
 *
 * @example
 * SkeletonButton();
 */

/**
 * Performs skeleton button operation
 *
 * @returns {any} The skeletonbutton result
 *
 * @example
 * SkeletonButton();
 */

export function SkeletonButton({
  variant = "default",
  className,
}: {
  /** Variant */
  variant?: "default" | "sm" | "lg";
  /** Class Name */
  className?: string;
}) {
  const variantClasses = {
    /** Default */
    default: "h-10 w-24",
    /** Sm */
    sm: "h-8 w-20",
    /** Lg */
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      className={cn("rounded-lg", variantClasses[variant], className)}
    />
  );
}

/**
 * Skeleton for image
 */
/**
 * Performs skeleton image operation
 *
 * @returns {any} The skeletonimage result
 *
 * @example
 * SkeletonImage();
 */

/**
 * Performs skeleton image operation
 *
 * @returns {any} The skeletonimage result
 *
 * @example
 * SkeletonImage();
 */

export function SkeletonImage({
  aspectRatio = "video",
  className,
}: {
  /** Aspect Ratio */
  aspectRatio?: "square" | "video" | "portrait";
  /** Class Name */
  className?: string;
}) {
  const ratioClasses = {
    /** Square */
    square: "aspect-square",
    /** Video */
    video: "aspect-video",
    /** Portrait */
    portrait: "aspect-[3/4]",
  };

  return (
    <Skeleton
      className={cn("w-full rounded-lg", ratioClasses[aspectRatio], className)}
    />
  );
}
