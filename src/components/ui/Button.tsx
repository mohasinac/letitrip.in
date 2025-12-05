/**
 * @fileoverview React Component
 * @module src/components/ui/Button
 * @description This file contains the Button component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * ButtonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ButtonProps
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variant */
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Is Loading */
  isLoading?: boolean;
  /** Left Icon */
  leftIcon?: React.ReactNode;
  /** Right Icon */
  rightIcon?: React.ReactNode;
  /** Full Width */
  fullWidth?: boolean;
}

const variantStyles = {
  /** Primary */
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
  /** Secondary */
  secondary:
    "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800",
  /** Danger */
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  /** Ghost */
  ghost:
    "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:bg-transparent disabled:text-gray-400",
  /** Outline */
  outline:
    "bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:text-gray-400",
};

const sizeStyles = {
  /** Sm */
  sm: "px-3 py-1.5 text-sm",
  /** Md */
  md: "px-4 py-2 text-base",
  /** Lg */
  lg: "px-6 py-3 text-lg",
};

/**
 * B
 * @constant
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-medium
          transition-colors duration-200
          focus-visible-ring
          touch-target
          /** Disabled */
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
