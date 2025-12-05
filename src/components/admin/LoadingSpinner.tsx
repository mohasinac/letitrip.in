/**
 * @fileoverview React Component
 * @module src/components/admin/LoadingSpinner
 * @description This file contains the LoadingSpinner component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

/**
 * LoadingSpinnerProps interface
 * 
 * @interface
 * @description Defines the structure and contract for LoadingSpinnerProps
 */
interface LoadingSpinnerProps {
  /** Size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Color */
  color?: "primary" | "white" | "gray";
  /** Full Screen */
  fullScreen?: boolean;
  /** Message */
  message?: string;
}

/**
 * Function: Loading Spinner
 */
/**
 * Performs loading spinner operation
 *
 * @returns {any} The loadingspinner result
 *
 * @example
 * LoadingSpinner();
 */

/**
 * Performs loading spinner operation
 *
 * @returns {any} The loadingspinner result
 *
 * @example
 * LoadingSpinner();
 */

export function LoadingSpinner({
  size = "md",
  color = "primary",
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizes = {
    /** Sm */
    sm: "h-4 w-4",
    /** Md */
    md: "h-8 w-8",
    /** Lg */
    lg: "h-12 w-12",
    /** Xl */
    xl: "h-16 w-16",
  };

  const colors = {
    /** Primary */
    primary: "border-blue-600",
    /** White */
    white: "border-white",
    /** Gray */
    gray: "border-gray-900",
  };

  /**
   * Performs spinner operation
   *
   * @returns {any} The spinner result
   */

  /**
   * Performs spinner operation
   *
   * @returns {any} The spinner result
   */

  const spinner = (
    <div
      className="flex flex-col items-center gap-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={`animate-spin rounded-full border-b-2 ${sizes[size]} ${colors[color]}`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
      {!message && <span className="sr-only">Loading...</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
