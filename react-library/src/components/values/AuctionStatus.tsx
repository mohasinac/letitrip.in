/**
 * AuctionStatus Display Component
 *
 * Displays auction status with proper styling and icons.
 *
 * @example
 * <AuctionStatus status="live" />              // 🟢 Live
 * <AuctionStatus status="ended" />             // ⬜ Ended
 * <AuctionStatus status="pending" />           // ⏳ Upcoming
 */

"use client";

// React import not needed in React 17+ JSX transform
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Gavel,
  XCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";

type AuctionStatusValue =
  | "live"
  | "active"
  | "pending"
  | "ended"
  | "cancelled"
  | "moderation"
  | "draft";

interface AuctionStatusProps {
  status: AuctionStatusValue;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  AuctionStatusValue,
  {
    label: string;
    icon: typeof Clock;
    bgClass: string;
    textClass: string;
  }
> = {
  live: {
    label: "Live",
    icon: Gavel,
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-700 dark:text-green-400",
  },
  active: {
    label: "Live",
    icon: Gavel,
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-700 dark:text-green-400",
  },
  pending: {
    label: "Upcoming",
    icon: Clock,
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-700 dark:text-yellow-400",
  },
  ended: {
    label: "Ended",
    icon: CheckCircle,
    bgClass: "bg-gray-100 dark:bg-gray-700",
    textClass: "text-gray-600 dark:text-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bgClass: "bg-red-100 dark:bg-red-900/30",
    textClass: "text-red-700 dark:text-red-400",
  },
  moderation: {
    label: "In Review",
    icon: Eye,
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    textClass: "text-purple-700 dark:text-purple-400",
  },
  draft: {
    label: "Draft",
    icon: AlertCircle,
    bgClass: "bg-gray-100 dark:bg-gray-700",
    textClass: "text-gray-600 dark:text-gray-400",
  },
};

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
  lg: "text-base px-3 py-1.5",
};

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 14,
};

export function AuctionStatus({
  status,
  size = "md",
  showIcon = true,
  className,
}: AuctionStatusProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon
          size={iconSizes[size]}
          className={
            status === "live" || status === "active" ? "animate-pulse" : ""
          }
        />
      )}
      {config.label}
    </span>
  );
}

export default AuctionStatus;
