/**
 * @fileoverview React Component
 * @module src/components/products/CompareButton
 * @description This file contains the CompareButton component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { GitCompare, Check } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import type { ComparisonProduct } from "@/services/comparison.service";

/**
 * CompareButtonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CompareButtonProps
 */
interface CompareButtonProps {
  /** Product */
  product: ComparisonProduct;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Variant */
  variant?: "icon" | "button" | "text";
  /** Class Name */
  className?: string;
}

/**
 * Function: Compare Button
 */
/**
 * Performs compare button operation
 *
 * @returns {any} The comparebutton result
 *
 * @example
 * CompareButton();
 */

/**
 * Performs compare button operation
 *
 * @returns {any} The comparebutton result
 *
 * @example
 * CompareButton();
 */

export function CompareButton({
  product,
  size = "md",
  variant = "icon",
  className = "",
}: CompareButtonProps) {
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();

  const inComparison = isInComparison(product.id);
  const disabled = !inComparison && !canAddMore;

  /**
   * Handles click event
   *
   * @param {React.MouseEvent} e - The e
   *
   * @returns {any} The handleclick result
   */

  /**
   * Handles click event
   *
   * @param {React.MouseEvent} e - The e
   *
   * @returns {any} The handleclick result
   */

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inComparison) {
      removeFromComparison(product.id);
    } else if (canAddMore) {
      addToComparison(product);
    }
  };

  const sizeClasses = {
    /** Sm */
    sm: "p-1.5",
    /** Md */
    md: "p-2",
    /** Lg */
    lg: "p-3",
  };

  const iconSizes = {
    /** Sm */
    sm: "w-4 h-4",
    /** Md */
    md: "w-5 h-5",
    /** Lg */
    lg: "w-6 h-6",
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          rounded-full transition-all duration-200
          ${
            inComparison
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : disabled
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-md"
          }
          ${className}
        `}
        aria-label={inComparison ? "Remove from compare" : "Add to compare"}
        title={
          disabled
            ? "Maximum products reached"
            : inComparison
              ? "Remove from compare"
              : "Add to compare"
        }
      >
        {inComparison ? (
          <Check className={iconSizes[size]} />
        ) : (
          <GitCompare className={iconSizes[size]} />
        )}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${
            inComparison
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : disabled
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          }
          ${className}
        `}
      >
        {inComparison ? (
          <>
            <Check className="w-4 h-4" />
            In Compare
          </>
        ) : (
          <>
            <GitCompare className="w-4 h-4" />
            Compare
          </>
        )}
      </button>
    );
  }

  // Text variant
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center gap-1 text-sm transition-colors duration-200
        ${
          inComparison
            ? "text-blue-600 dark:text-blue-400"
            : disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        }
        ${className}
      `}
    >
      {inComparison ? (
        <>
          <Check className="w-4 h-4" />
          Added
        </>
      ) : (
        <>
          <GitCompare className="w-4 h-4" />
          Compare
        </>
      )}
    </button>
  );
}
