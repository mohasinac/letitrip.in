/**
 * @fileoverview React Component
 * @module src/components/common/values/AuctionStatus
 * @description This file contains the AuctionStatus component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

import React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AuctionStatusValue type
 * 
 * @typedef {Object} AuctionStatusValue
 * @description Type definition for AuctionStatusValue
 */
type AuctionStatusValue =
  | "live"
  | "active"
  | "pending"
  | "ended"
  | "cancelled"
  | "moderation"
  | "draft";

/**
 * AuctionStatusProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AuctionStatusProps
 */
interface AuctionStatusProps {
  /** Status */
  status: AuctionStatusValue;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Show Icon */
  showIcon?: boolean;
  /** Class Name */
  className?: string;
}

const statusConfig: Record<
  AuctionStatusValue,
  {
    /** Label */
    label: string;
    /** Icon */
    icon: typeof Clock;
    /** Bg Class */
    bgClass: string;
    /** Text Class */
    textClass: string;
  }
> = {
  /** Live */
  live: {
    /** Label */
    label: "Live",
    /** Icon */
    icon: Gavel,
    /** Bg Class */
    bgClass: "bg-green-100 dark:bg-green-900/30",
    /** Text Class */
    textClass: "text-green-700 dark:text-green-400",
  },
  /** Active */
  active: {
    /** Label */
    label: "Live",
    /** Icon */
    icon: Gavel,
    /** Bg Class */
    bgClass: "bg-green-100 dark:bg-green-900/30",
    /** Text Class */
    textClass: "text-green-700 dark:text-green-400",
  },
  /** Pending */
  pending: {
    /** Label */
    label: "Upcoming",
    /** Icon */
    icon: Clock,
    /** Bg Class */
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    /** Text Class */
    textClass: "text-yellow-700 dark:text-yellow-400",
  },
  /** Ended */
  ended: {
    /** Label */
    label: "Ended",
    /** Icon */
    icon: CheckCircle,
    /** Bg Class */
    bgClass: "bg-gray-100 dark:bg-gray-700",
    /** Text Class */
    textClass: "text-gray-600 dark:text-gray-400",
  },
  /** Cancelled */
  cancelled: {
    /** Label */
    label: "Cancelled",
    /** Icon */
    icon: XCircle,
    /** Bg Class */
    bgClass: "bg-red-100 dark:bg-red-900/30",
    /** Text Class */
    textClass: "text-red-700 dark:text-red-400",
  },
  /** Moderation */
  moderation: {
    /** Label */
    label: "In Review",
    /** Icon */
    icon: Eye,
    /** Bg Class */
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    /** Text Class */
    textClass: "text-purple-700 dark:text-purple-400",
  },
  /** Draft */
  draft: {
    /** Label */
    label: "Draft",
    /** Icon */
    icon: AlertCircle,
    /** Bg Class */
    bgClass: "bg-gray-100 dark:bg-gray-700",
    /** Text Class */
    textClass: "text-gray-600 dark:text-gray-400",
  },
};

const sizeClasses = {
  /** Sm */
  sm: "text-xs px-1.5 py-0.5",
  /** Md */
  md: "text-sm px-2 py-1",
  /** Lg */
  lg: "text-base px-3 py-1.5",
};

const iconSizes = {
  /** Sm */
  sm: 10,
  /** Md */
  md: 12,
  /** Lg */
  lg: 14,
};

/**
 * Function: Auction Status
 */
/**
 * Performs auction status operation
 *
 * @returns {any} The auctionstatus result
 *
 * @example
 * AuctionStatus();
 */

/**
 * Performs auction status operation
 *
 * @returns {any} The auctionstatus result
 *
 * @example
 * AuctionStatus();
 */

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
        className,
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
