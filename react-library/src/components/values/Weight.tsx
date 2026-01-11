/**
 * Weight Display Component
 *
 * Displays weight with automatic unit conversion (g, kg).
 *
 * @example
 * <Weight grams={500} />                   // 500g
 * <Weight grams={1500} />                  // 1.5kg
 * <Weight grams={2000} showBoth />         // 2kg (2,000g)
 */

"use client";

import React from "react";
import { cn } from "../../utils/cn";

interface WeightProps {
  grams: number;
  showBoth?: boolean;
  className?: string;
  precision?: number;
}

export function Weight({
  grams,
  showBoth = false,
  className,
  precision = 2,
}: WeightProps) {
  if (grams < 1000) {
    return (
      <span className={cn("text-gray-700 dark:text-gray-300", className)}>
        {grams.toLocaleString("en-IN")}g
      </span>
    );
  }

  const kg = grams / 1000;
  const formattedKg =
    kg % 1 === 0 ? kg.toString() : kg.toFixed(precision).replace(/\.?0+$/, "");

  return (
    <span className={cn("text-gray-700 dark:text-gray-300", className)}>
      {formattedKg}kg
      {showBoth && (
        <span className="text-gray-500 dark:text-gray-400 ml-1">
          ({grams.toLocaleString("en-IN")}g)
        </span>
      )}
    </span>
  );
}

export default Weight;
