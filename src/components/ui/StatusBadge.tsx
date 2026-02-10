"use client";

import { Badge } from "@/components";

/**
 * StatusBadge Component
 *
 * Displays status with appropriate color from THEME_CONSTANTS.badge.
 * Replaces 20+ inline badge renderings across admin pages.
 *
 * @example
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status="pending" />
 * <StatusBadge status="approved" />
 * ```
 */

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const STATUS_LABELS: Record<StatusType, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  info: "Info",
};

const STATUS_VARIANTS: Record<StatusType, any> = {
  active: "active",
  inactive: "inactive",
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={className}>
      {label || STATUS_LABELS[status]}
    </Badge>
  );
}
