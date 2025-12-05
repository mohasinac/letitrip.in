/**
 * @fileoverview React Component
 * @module src/components/ui/Text
 * @description This file contains the Text component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * TextSize type
 * 
 * @typedef {Object} TextSize
 * @description Type definition for TextSize
 */
type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
/**
 * TextColor type
 * 
 * @typedef {Object} TextColor
 * @description Type definition for TextColor
 */
type TextColor = "default" | "muted" | "error" | "success" | "warning" | "info";
/**
 * TextTag type
 * 
 * @typedef {Object} TextTag
 * @description Type definition for TextTag
 */
type TextTag = "p" | "span" | "div";

/**
 * TextProps interface
 * 
 * @interface
 * @description Defines the structure and contract for TextProps
 */
export interface TextProps {
  /** Size */
  size?: TextSize;
  /** Color */
  color?: TextColor;
  /** As */
  as?: TextTag;
  /** Weight */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /** Truncate */
  truncate?: boolean;
  /** Children */
  children: React.ReactNode;
  /** Class Name */
  className?: string;
  /** Id */
  id?: string;
}

const sizeClasses: Record<TextSize, string> = {
  /** Xs */
  xs: "text-xs",
  /** Sm */
  sm: "text-sm",
  /** Base */
  base: "text-base",
  /** Lg */
  lg: "text-lg",
  /** Xl */
  xl: "text-xl",
};

const colorClasses: Record<TextColor, string> = {
  /** Default */
  default: "text-gray-700 dark:text-gray-300",
  /** Muted */
  muted: "text-gray-500 dark:text-gray-400",
  /** Error */
  error: "text-red-600 dark:text-red-400",
  /** Success */
  success: "text-green-600 dark:text-green-400",
  /** Warning */
  warning: "text-yellow-600 dark:text-yellow-400",
  /** Info */
  info: "text-blue-600 dark:text-blue-400",
};

const weightClasses: Record<string, string> = {
  /** Normal */
  normal: "font-normal",
  /** Medium */
  medium: "font-medium",
  /** Semibold */
  semibold: "font-semibold",
  /** Bold */
  bold: "font-bold",
};

/**
 * Text - Consistent text component with size, color, and weight variants
 *
 * Features:
 * - Multiple sizes (xs, sm, base, lg, xl)
 * - Semantic colors (default, muted, error, success, warning, info)
 * - Weight control
 * - Truncation option
 * - Dark mode support
 *
 * @example
 * <Text>Default paragraph text</Text>
 * <Text size="sm" color="muted">Helper text</Text>
 * <Text color="error">Error message</Text>
 */
/**
 * Performs text operation
 *
 * @returns {any} The text result
 *
 * @example
 * Text();
 */

/**
 * T
 * @constant
 */
/**
 * Performs text operation
 *
 * @returns {any} The text result
 *
 * @example
 * Text();
 */

/**
 * T
 * @constant
 */
export const Text: React.FC<TextProps> = ({
  size = "base",
  color = "default",
  as = "p",
  weight = "normal",
  truncate = false,
  children,
  className,
  id,
}) => {
  const Tag = as;

  return (
    <Tag
      id={id}
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        weightClasses[weight],
        truncate && "truncate",
        className,
      )}
    >
      {children}
    </Tag>
  );
};

export default Text;
