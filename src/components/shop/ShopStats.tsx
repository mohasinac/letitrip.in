"use client";

import { Package, Users, TrendingUp, Star } from "lucide-react";
import type { ShopFE } from "@/types/frontend/shop.types";

export interface ShopStatsProps {
  shop: ShopFE;
  className?: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

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
export function ShopStats({ shop, className = "" }: ShopStatsProps) {
  const stats: StatCardProps[] = [
    {
      icon: Package,
      label: "Products",
      value: shop.productCount || 0,
    },
    {
      icon: Users,
      label: "Followers",
      value: shop.follower_count || 0,
    },
    {
      icon: TrendingUp,
      label: "Total Sales",
      value: shop.totalOrders || 0,
    },
    {
      icon: Star,
      label: "Average Rating",
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
