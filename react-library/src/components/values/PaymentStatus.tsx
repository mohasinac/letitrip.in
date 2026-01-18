/**
 * Payment Status Display Component
 *
 * Displays payment status with appropriate colors and icons.
 *
 * @example
 * <PaymentStatus status="paid" />          // ✅ Paid (green)
 * <PaymentStatus status="pending" />       // 🕐 Pending (yellow)
 * <PaymentStatus status="failed" />        // ❌ Failed (red)
 */


import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import { cn } from "../../utils/cn";

type PaymentStatusType =
  | "pending"
  | "processing"
  | "paid"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

interface PaymentStatusProps {
  status: PaymentStatusType;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  PaymentStatusType,
  {
    label: string;
    icon: React.ElementType;
    colors: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    colors:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  processing: {
    label: "Processing",
    icon: CreditCard,
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    colors: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  refunded: {
    label: "Refunded",
    icon: RotateCcw,
    colors:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  partially_refunded: {
    label: "Partially Refunded",
    icon: RotateCcw,
    colors:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    colors: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function PaymentStatus({
  status,
  showIcon = true,
  size = "md",
  className,
}: PaymentStatusProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        config.colors,
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
