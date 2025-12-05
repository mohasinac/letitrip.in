/**
 * @fileoverview React Component
 * @module src/components/common/StatusBadge
 * @description This file contains the StatusBadge component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

/**
 * StatusType type
 * 
 * @typedef {Object} StatusType
 * @description Type definition for StatusType
 */
export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "banned"
  | "verified"
  | "unverified"
  | "featured"
  | "draft"
  | "published"
  | "archived"
  | "success"
  | "error"
  | "warning"
  | "info";

/**
 * StatusBadgeProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StatusBadgeProps
 */
export interface StatusBadgeProps {
  /** Status */
  status: StatusType | string;
  /** Variant */
  variant?: "default" | "outline" | "solid";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Class Name */
  className?: string;
}

const statusStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  /** Active */
  active: {
    /** Bg */
    bg: "bg-green-100 dark:bg-green-900/30",
    /** Text */
    text: "text-green-800 dark:text-green-400",
    /** Border */
    border: "border-green-300 dark:border-green-700",
  },
  /** Inactive */
  inactive: {
    /** Bg */
    bg: "bg-gray-100 dark:bg-gray-700",
    /** Text */
    text: "text-gray-800 dark:text-gray-300",
    /** Border */
    border: "border-gray-300 dark:border-gray-600",
  },
  /** Pending */
  pending: {
    /** Bg */
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    /** Text */
    text: "text-yellow-800 dark:text-yellow-400",
    /** Border */
    border: "border-yellow-300 dark:border-yellow-700",
  },
  /** Approved */
  approved: {
    /** Bg */
    bg: "bg-green-100 dark:bg-green-900/30",
    /** Text */
    text: "text-green-800 dark:text-green-400",
    /** Border */
    border: "border-green-300 dark:border-green-700",
  },
  /** Rejected */
  rejected: {
    /** Bg */
    bg: "bg-red-100 dark:bg-red-900/30",
    /** Text */
    text: "text-red-800 dark:text-red-400",
    /** Border */
    border: "border-red-300 dark:border-red-700",
  },
  /** Banned */
  banned: {
    /** Bg */
    bg: "bg-red-100 dark:bg-red-900/30",
    /** Text */
    text: "text-red-800 dark:text-red-400",
    /** Border */
    border: "border-red-300 dark:border-red-700",
  },
  /** Verified */
  verified: {
    /** Bg */
    bg: "bg-blue-100 dark:bg-blue-900/30",
    /** Text */
    text: "text-blue-800 dark:text-blue-400",
    /** Border */
    border: "border-blue-300 dark:border-blue-700",
  },
  /** Unverified */
  unverified: {
    /** Bg */
    bg: "bg-gray-100 dark:bg-gray-700",
    /** Text */
    text: "text-gray-800 dark:text-gray-300",
    /** Border */
    border: "border-gray-300 dark:border-gray-600",
  },
  /** Featured */
  featured: {
    /** Bg */
    bg: "bg-purple-100 dark:bg-purple-900/30",
    /** Text */
    text: "text-purple-800 dark:text-purple-400",
    /** Border */
    border: "border-purple-300 dark:border-purple-700",
  },
  /** Draft */
  draft: {
    /** Bg */
    bg: "bg-gray-100 dark:bg-gray-700",
    /** Text */
    text: "text-gray-800 dark:text-gray-300",
    /** Border */
    border: "border-gray-300 dark:border-gray-600",
  },
  /** Published */
  published: {
    /** Bg */
    bg: "bg-green-100 dark:bg-green-900/30",
    /** Text */
    text: "text-green-800 dark:text-green-400",
    /** Border */
    border: "border-green-300 dark:border-green-700",
  },
  /** Archived */
  archived: {
    /** Bg */
    bg: "bg-gray-100 dark:bg-gray-700",
    /** Text */
    text: "text-gray-800 dark:text-gray-300",
    /** Border */
    border: "border-gray-300 dark:border-gray-600",
  },
  /** Success */
  success: {
    /** Bg */
    bg: "bg-green-100 dark:bg-green-900/30",
    /** Text */
    text: "text-green-800 dark:text-green-400",
    /** Border */
    border: "border-green-300 dark:border-green-700",
  },
  /** Error */
  error: {
    /** Bg */
    bg: "bg-red-100 dark:bg-red-900/30",
    /** Text */
    text: "text-red-800 dark:text-red-400",
    /** Border */
    border: "border-red-300 dark:border-red-700",
  },
  /** Warning */
  warning: {
    /** Bg */
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    /** Text */
    text: "text-yellow-800 dark:text-yellow-400",
    /** Border */
    border: "border-yellow-300 dark:border-yellow-700",
  },
  /** Info */
  info: {
    /** Bg */
    bg: "bg-blue-100 dark:bg-blue-900/30",
    /** Text */
    text: "text-blue-800 dark:text-blue-400",
    /** Border */
    border: "border-blue-300 dark:border-blue-700",
  },
};

const sizeStyles = {
  /** Sm */
  sm: "px-2 py-0.5 text-xs",
  /** Md */
  md: "px-2.5 py-1 text-sm",
  /** Lg */
  lg: "px-3 py-1.5 text-base",
};

/**
 * Function: Status Badge
 */
/**
 * Performs status badge operation
 *
 * @returns {any} The statusbadge result
 *
 * @example
 * StatusBadge();
 */

/**
 * Performs status badge operation
 *
 * @returns {any} The statusbadge result
 *
 * @example
 * StatusBadge();
 */

export function StatusBadge({
  status,
  variant = "default",
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const styles = statusStyles[normalizedStatus] || statusStyles.info;

  const baseClasses = `inline-flex items-center font-medium rounded-full ${sizeStyles[size]}`;

  const variantClasses = {
    /** Default */
    default: `${styles.bg} ${styles.text}`,
    /** Outline */
    outline: `bg-transparent ${styles.text} border ${styles.border}`,
    /** Solid */
    solid: `${styles.bg} ${styles.text}`,
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
