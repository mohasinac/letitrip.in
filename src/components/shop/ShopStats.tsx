/**
 * @fileoverview React Component
 * @module src/components/shop/ShopStats
 * @description This file contains the ShopStats component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { Package, Users, TrendingUp, Star } from "lucide-react";
import type { ShopFE } from "@/types/frontend/shop.types";

/**
 * ShopStatsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopStatsProps
 */
export interface ShopStatsProps {
  /** Shop */
  shop: ShopFE;
  /** Class Name */
  className?: string;
}

/**
 * StatCardProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StatCardProps
 */
interface StatCardProps {
  /** Icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Label */
  label: string;
  /** Value */
  value: number | string;
  /** Trend */
  trend?: {
    /** Value */
    value: number;
    /** Is Positive */
    isPositive: boolean;
  };
}

/**
 * Function: Stat Card
 */
/**
 * Performs stat card operation
 *
 * @param {Icon, label, value, trend }} { icon - The { icon
 *
 * @returns {any} The statcard result
 */

/**
 * Performs stat card operation
 *
 * @param {Icon, label, value, trend }} { icon - The { icon
 *
 * @returns {any} The statcard result
 */

function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-6 h-6 text-primary" />
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

/**
 * ShopStats Component
 *
 * Displays key shop metrics in a responsive grid.
 * Used on shop detail pages.
 *
 * Features:
 * - Product count
 * - Follower count
 * - Sales/orders count
 * - Average rating
 * - Responsive grid (2x2 mobile → 4x1 desktop)
 * - Optional trend indicators
 *
 * @example
 * ```tsx
 * <ShopStats shop={shop} />
 * ```
 */
/**
 * Performs shop stats operation
 *
 * @param {ShopStatsProps} [{ shop, className] - Name of { shop, class
 *
 * @returns {any} The shopstats result
 *
 * @example
 * ShopStats({ shop, className);
 */

/**
 * Performs shop stats operation
 *
 * @param {ShopStatsProps} [{ shop, className] - Name of { shop, class
 *
 * @returns {any} The shopstats result
 *
 * @example
 * ShopStats({ shop, className);
 */

export function ShopStats({ shop, className = "" }: ShopStatsProps) {
  const stats: StatCardProps[] = [
    {
      /** Icon */
      icon: Package,
      /** Label */
      label: "Products",
      /** Value */
      value: shop.productCount || 0,
    },
    {
      /** Icon */
      icon: Users,
      /** Label */
      label: "Followers",
      /** Value */
      value: shop.follower_count || 0,
    },
    {
      /** Icon */
      icon: TrendingUp,
      /** Label */
      label: "Total Sales",
      /** Value */
      value: shop.totalOrders || 0,
    },
    {
      /** Icon */
      icon: Star,
      /** Label */
      label: "Average Rating",
      /** Value */
      value: shop.rating ? shop.rating.toFixed(1) : "0.0",
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

export default ShopStats;
