/**
 * @fileoverview Centralized Status Badge Configurations
 * @module src/constants/status-configs
 * @description Unified status badge styling and text configurations for all entity types.
 * Eliminates duplication across multiple components.
 *
 * @created 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Home,
  Package,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";

/**
 * Status badge style configuration
 * @interface
 */
export interface StatusConfig {
  /** Display label */
  label: string;
  /** Background color class */
  bgColor: string;
  /** Text color class */
  textColor: string;
  /** Border color class */
  borderColor?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Hover effect */
  hoverBg?: string;
  /** Description */
  description?: string;
}

/**
 * Status configurations by category
 * @constant
 */
export const STATUS_CONFIGS = {
  // Order Statuses
  orders: {
    pending: {
      label: "Pending",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: Clock,
      description: "Order is awaiting processing",
    },
    processing: {
      label: "Processing",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-300",
      icon: Package,
      description: "Order is being prepared",
    },
    shipped: {
      label: "Shipped",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-800",
      borderColor: "border-indigo-300",
      icon: Truck,
      description: "Order is in transit",
    },
    delivered: {
      label: "Delivered",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: Home,
      description: "Order has been delivered",
    },
    cancelled: {
      label: "Cancelled",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
      description: "Order has been cancelled",
    },
    refunded: {
      label: "Refunded",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-300",
      icon: DollarSign,
      description: "Payment has been refunded",
    },
  } as Record<string, StatusConfig>,

  // Payment Statuses
  payments: {
    pending: {
      label: "Pending",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: Clock,
    },
    completed: {
      label: "Completed",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    failed: {
      label: "Failed",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
    },
    refunded: {
      label: "Refunded",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-300",
      icon: DollarSign,
    },
  } as Record<string, StatusConfig>,

  // Product Statuses
  products: {
    active: {
      label: "Active",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    draft: {
      label: "Draft",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: FileText,
    },
    archived: {
      label: "Archived",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      borderColor: "border-orange-300",
      icon: Archive,
    },
    out_of_stock: {
      label: "Out of Stock",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: AlertCircle,
    },
  } as Record<string, StatusConfig>,

  // Auction Statuses
  auctions: {
    upcoming: {
      label: "Upcoming",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-300",
      icon: Clock,
    },
    active: {
      label: "Active",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: Zap,
    },
    ending_soon: {
      label: "Ending Soon",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      borderColor: "border-orange-300",
      icon: AlertCircle,
    },
    ended: {
      label: "Ended",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: Archive,
    },
    cancelled: {
      label: "Cancelled",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
    },
  } as Record<string, StatusConfig>,

  // User/Account Statuses
  users: {
    active: {
      label: "Active",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    inactive: {
      label: "Inactive",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: AlertCircle,
    },
    suspended: {
      label: "Suspended",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
    },
    pending: {
      label: "Pending Verification",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: Clock,
    },
  } as Record<string, StatusConfig>,

  // Shop Statuses
  shops: {
    active: {
      label: "Active",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending Approval",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: Clock,
    },
    suspended: {
      label: "Suspended",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
    },
    closed: {
      label: "Closed",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: Archive,
    },
  } as Record<string, StatusConfig>,

  // Ticket/Support Statuses
  tickets: {
    open: {
      label: "Open",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-300",
      icon: AlertCircle,
    },
    in_progress: {
      label: "In Progress",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: Clock,
    },
    resolved: {
      label: "Resolved",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    closed: {
      label: "Closed",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: Archive,
    },
  } as Record<string, StatusConfig>,

  // Verification Statuses
  verification: {
    verified: {
      label: "Verified",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: Clock,
    },
    rejected: {
      label: "Rejected",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
    },
    not_verified: {
      label: "Not Verified",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
      icon: AlertCircle,
    },
  } as Record<string, StatusConfig>,

  // Generic/Common Statuses
  common: {
    success: {
      label: "Success",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    warning: {
      label: "Warning",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      icon: AlertCircle,
    },
    error: {
      label: "Error",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      icon: XCircle,
    },
    info: {
      label: "Info",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-300",
      icon: AlertCircle,
    },
  } as Record<string, StatusConfig>,
} as const;

/**
 * Get status configuration
 *
 * @param {string} category - Status category (orders, payments, etc.)
 * @param {string} status - Status value
 * @returns {StatusConfig | undefined} Status configuration
 *
 * @example
 * const config = getStatusConfig('orders', 'shipped');
 * // Returns: { label: 'Shipped', bgColor: 'bg-indigo-100', ... }
 */
export function getStatusConfig(
  category: keyof typeof STATUS_CONFIGS,
  status: string
): StatusConfig | undefined {
  const categoryConfigs = STATUS_CONFIGS[category];
  if (!categoryConfigs) return undefined;

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  return categoryConfigs[normalizedStatus];
}

/**
 * Get status configuration with fallback
 *
 * @param {string} category - Status category
 * @param {string} status - Status value
 * @param {StatusConfig} fallback - Fallback configuration
 * @returns {StatusConfig} Status configuration or fallback
 *
 * @example
 * const config = getStatusConfigOrDefault('orders', 'unknown', {
 *   label: 'Unknown',
 *   bgColor: 'bg-gray-100',
 *   textColor: 'text-gray-800',
 * });
 */
export function getStatusConfigOrDefault(
  category: keyof typeof STATUS_CONFIGS,
  status: string,
  fallback: StatusConfig
): StatusConfig {
  return getStatusConfig(category, status) ?? fallback;
}

/**
 * Get all statuses for a category
 *
 * @param {string} category - Status category
 * @returns {Record<string, StatusConfig>} All statuses in category
 *
 * @example
 * const orderStatuses = getAllStatusesForCategory('orders');
 * // Returns: { pending: {...}, processing: {...}, ... }
 */
export function getAllStatusesForCategory(
  category: keyof typeof STATUS_CONFIGS
): Record<string, StatusConfig> {
  return STATUS_CONFIGS[category] ?? {};
}

/**
 * Default status configuration for unknown statuses
 * @constant
 */
export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  label: "Unknown",
  bgColor: "bg-gray-100",
  textColor: "text-gray-800",
  borderColor: "border-gray-300",
  icon: AlertCircle,
};

/**
 * Type for status category keys
 * @typedef {keyof typeof STATUS_CONFIGS} StatusCategory
 */
export type StatusCategory = keyof typeof STATUS_CONFIGS;

/**
 * Type for order status keys
 * @typedef {keyof typeof STATUS_CONFIGS.orders} OrderStatus
 */
export type OrderStatus = keyof typeof STATUS_CONFIGS.orders;

/**
 * Type for payment status keys
 * @typedef {keyof typeof STATUS_CONFIGS.payments} PaymentStatus
 */
export type PaymentStatus = keyof typeof STATUS_CONFIGS.payments;

/**
 * Type for product status keys
 * @typedef {keyof typeof STATUS_CONFIGS.products} ProductStatus
 */
export type ProductStatus = keyof typeof STATUS_CONFIGS.products;

/**
 * Type for auction status keys
 * @typedef {keyof typeof STATUS_CONFIGS.auctions} AuctionStatus
 */
export type AuctionStatus = keyof typeof STATUS_CONFIGS.auctions;

export default STATUS_CONFIGS;
