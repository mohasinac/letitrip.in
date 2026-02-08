import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Badge Component
 *
 * A compact label component used to display status, categories, or small pieces of information.
 * Available in multiple variants, sizes, and can be rounded for different design needs.
 *
 * @component
 * @example
 * ```tsx
 * <Badge variant="success" size="md" rounded>
 *   Active
 * </Badge>
 * ```
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  rounded = false,
  className = "",
}: BadgeProps) {
  const { colors } = THEME_CONSTANTS;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const variantClasses = {
    default: colors.badge.default,
    primary: colors.badge.primary,
    secondary: colors.badge.secondary,
    success: colors.badge.success,
    warning: colors.badge.warning,
    danger: colors.badge.danger,
    info: colors.badge.info,
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${rounded ? "rounded-full" : "rounded-lg"}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
