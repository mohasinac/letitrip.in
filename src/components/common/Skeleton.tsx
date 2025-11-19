import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
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
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for text lines
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
 * Skeleton for avatar/profile picture
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
 * Skeleton for button
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
 * Skeleton for image
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
