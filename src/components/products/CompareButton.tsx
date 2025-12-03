"use client";

import React from "react";
import { GitCompare, Check } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import type { ComparisonProduct } from "@/services/comparison.service";

interface CompareButtonProps {
  product: ComparisonProduct;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button" | "text";
  className?: string;
}

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
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
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
