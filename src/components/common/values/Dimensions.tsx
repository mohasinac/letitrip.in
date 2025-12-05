/**
 * @fileoverview React Component
 * @module src/components/common/values/Dimensions
 * @description This file contains the Dimensions component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Dimensions Display Component
 *
 * Displays product dimensions in standard format.
 *
 * @example
 * <Dimensions length={30} width={20} height={10} unit="cm" />  // 30 × 20 × 10 cm
 * <Dimensions length={1.5} width={0.8} unit="m" />             // 1.5 × 0.8 m
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * DimensionsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DimensionsProps
 */
interface DimensionsProps {
  /** Length */
  length: number;
  /** Width */
  width: number;
  /** Height */
  height?: number;
  /** Unit */
  unit?: "cm" | "m" | "in" | "ft";
  /** Class Name */
  className?: string;
  /** Compact */
  compact?: boolean;
}

/**
 * Function: Dimensions
 */
/**
 * Performs dimensions operation
 *
 * @returns {any} The dimensions result
 *
 * @example
 * Dimensions();
 */

/**
 * Performs dimensions operation
 *
 * @returns {any} The dimensions result
 *
 * @example
 * Dimensions();
 */

export function Dimensions({
  length,
  width,
  height,
  unit = "cm",
  className,
  compact = false,
}: DimensionsProps) {
  const separator = compact ? "×" : " × ";

  const parts = [length, width];
  if (height !== undefined && height > 0) {
    parts.push(height);
  }

  const dimensionText = parts
    .map((d) => (d % 1 === 0 ? d.toString() : d.toFixed(1)))
    .join(separator);

  return (
    <span className={cn("text-gray-700 dark:text-gray-300", className)}>
      {dimensionText}
      <span className="text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
    </span>
  );
}

export default Dimensions;
