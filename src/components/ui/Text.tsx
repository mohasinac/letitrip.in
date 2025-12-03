"use client";

import React from "react";
import { cn } from "@/lib/utils";

type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
type TextColor = "default" | "muted" | "error" | "success" | "warning" | "info";
type TextTag = "p" | "span" | "div";

export interface TextProps {
  size?: TextSize;
  color?: TextColor;
  as?: TextTag;
  weight?: "normal" | "medium" | "semibold" | "bold";
  truncate?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const sizeClasses: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const colorClasses: Record<TextColor, string> = {
  default: "text-gray-700 dark:text-gray-300",
  muted: "text-gray-500 dark:text-gray-400",
  error: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
};

const weightClasses: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
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
