import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Badge Component
 *
 * A compact label component with ring borders for status, roles, and categories.
 * Enhanced with role-specific variants and improved dark mode support.
 *
 * @component
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="admin">Admin</Badge>
 * <Badge variant="pending">Pending Approval</Badge>
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
    | "info"
    | "active"
    | "inactive"
    | "pending"
    | "approved"
    | "rejected"
    | "admin"
    | "moderator"
    | "seller"
    | "user";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const { badge, colors } = THEME_CONSTANTS;

  // Use new enhanced badge styles if available, fallback to legacy colors
  const variantClasses = {
    // Status badges (enhanced with ring borders)
    active: badge?.active || colors.badge.success,
    inactive: badge?.inactive || colors.badge.default,
    pending: badge?.pending || colors.badge.warning,
    approved: badge?.approved || colors.badge.success,
    rejected: badge?.rejected || colors.badge.danger,
    // Semantic badges
    success: badge?.success || colors.badge.success,
    warning: badge?.warning || colors.badge.warning,
    danger: badge?.danger || colors.badge.danger,
    info: badge?.info || colors.badge.info,
    // Role badges (enhanced)
    admin: badge?.admin || colors.badge.secondary,
    moderator: badge?.moderator || colors.badge.info,
    seller: badge?.seller || colors.badge.primary,
    user: badge?.user || colors.badge.default,
    // Legacy variants
    default: badge?.inactive || colors.badge.default,
    primary: colors.badge.primary,
    secondary: colors.badge.secondary,
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
