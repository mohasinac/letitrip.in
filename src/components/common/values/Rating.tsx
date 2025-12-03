/**
 * Rating Display Component
 *
 * Displays star ratings with optional review count.
 *
 * @example
 * <Rating value={4.5} />                          // ★★★★½ 4.5
 * <Rating value={4.5} reviewCount={123} />        // ★★★★½ 4.5 (123)
 * <Rating value={4.5} showNumber={false} />       // ★★★★½
 */

"use client";

import React from "react";
import { Star } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  maxValue?: number;
  reviewCount?: number;
  showNumber?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: { star: 12, text: "text-xs" },
  sm: { star: 14, text: "text-sm" },
  md: { star: 16, text: "text-base" },
  lg: { star: 20, text: "text-lg" },
};

export function Rating({
  value,
  maxValue = 5,
  reviewCount,
  showNumber = true,
  size = "md",
  className,
}: RatingProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.25 && value % 1 < 0.75;
  const almostFullStar = value % 1 >= 0.75;
  const emptyStars =
    maxValue - fullStars - (hasHalfStar || almostFullStar ? 1 : 0);

  const { star: starSize, text: textClass } = sizeClasses[size];

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars + (almostFullStar ? 1 : 0) }).map(
        (_, i) => (
          <Star
            key={`full-${i}`}
            size={starSize}
            className="text-yellow-500 fill-yellow-500"
          />
        ),
      )}

      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star size={starSize} className="text-gray-300 dark:text-gray-600" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={starSize} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={starSize}
          className="text-gray-300 dark:text-gray-600"
        />
      ))}

      {/* Number and review count */}
      {showNumber && (
        <span
          className={cn(
            "ml-1 font-medium text-gray-900 dark:text-white",
            textClass,
          )}
        >
          {value.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={cn("text-gray-500 dark:text-gray-400", textClass)}>
          ({reviewCount > 999 ? formatCompactNumber(reviewCount) : reviewCount})
        </span>
      )}
    </span>
  );
}
