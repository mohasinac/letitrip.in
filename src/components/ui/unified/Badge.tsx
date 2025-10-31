/**
 * Unified Badge Component
 * Single source of truth for all badge/chip variants
 * Status indicators, tags, counts, and labels
 */

"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnifiedBadgeProps {
  // Content
  children: React.ReactNode;

  // Variants
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "outline"
    | "ghost";

  // Sizes
  size?: "xs" | "sm" | "md" | "lg";

  // Style
  rounded?: boolean;
  dot?: boolean;

  // Removable
  onRemove?: () => void;

  // HTML
  className?: string;
}

const variantClasses = {
  default: "bg-surface border-2 border-border text-text",
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  success: "bg-success text-white",
  error: "bg-error text-white",
  warning: "bg-warning text-textDark",
  info: "bg-info text-white",
  outline: "bg-transparent border-2 border-current",
  ghost: "bg-text/10 text-text",
};

const sizeClasses = {
  xs: "text-xs px-1.5 py-0.5",
  sm: "text-sm px-2 py-1",
  md: "text-base px-2.5 py-1",
  lg: "text-lg px-3 py-1.5",
};

const dotSizeClasses = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export const UnifiedBadge: React.FC<UnifiedBadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  rounded = false,
  dot = false,
  onRemove,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        "transition-colors",
        rounded ? "rounded-full" : "rounded-md",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full",
            dotSizeClasses[size],
            variant === "default" || variant === "outline"
              ? "bg-current"
              : "bg-white"
          )}
        />
      )}

      <span>{children}</span>

      {onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            "ml-0.5 hover:bg-white/20 rounded-full p-0.5",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          )}
          aria-label="Remove badge"
        >
          <X className={cn(size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3")} />
        </button>
      )}
    </span>
  );
};

// ============================================================================
// STATUS BADGE
// ============================================================================

export interface StatusBadgeProps
  extends Omit<UnifiedBadgeProps, "variant" | "dot"> {
  status: "active" | "inactive" | "pending" | "success" | "error" | "warning";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  ...props
}) => {
  const statusVariants = {
    active: "success",
    inactive: "default",
    pending: "warning",
    success: "success",
    error: "error",
    warning: "warning",
  } as const;

  const statusLabels = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    success: "Success",
    error: "Error",
    warning: "Warning",
  };

  return (
    <UnifiedBadge variant={statusVariants[status]} dot {...props}>
      {children || statusLabels[status]}
    </UnifiedBadge>
  );
};

// ============================================================================
// COUNT BADGE
// ============================================================================

export interface CountBadgeProps extends Omit<UnifiedBadgeProps, "children"> {
  count: number;
  max?: number;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  ...props
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <UnifiedBadge rounded size="xs" {...props}>
      {displayCount}
    </UnifiedBadge>
  );
};

export default UnifiedBadge;
