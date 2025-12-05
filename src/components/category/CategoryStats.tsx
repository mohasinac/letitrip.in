/**
 * @fileoverview React Component
 * @module src/components/category/CategoryStats
 * @description This file contains the CategoryStats component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { Package, Store, Star, Tag } from "lucide-react";
import { Price } from "@/components/common/values/Price";

/**
 * CategoryStatsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryStatsProps
 */
export interface CategoryStatsProps {
  /** Product Count */
  productCount: number;
  /** Seller Count */
  sellerCount: number;
  /** Price Range */
  priceRange: {
    /** Min */
    min: number;
    /** Max */
    max: number;
  };
  /** Average Rating */
  averageRating?: number;
  /** Popular Brands */
  popularBrands?: string[];
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
  value: string | number | React.ReactNode;
  /** Subtitle */
  subtitle?: string;
}

/**
 * Function: Stat Card
 */
/**
 * Performs stat card operation
 *
 * @param {Icon, label, value, subtitle }} { icon - The { icon
 *
 * @returns {any} The statcard result
 */

/**
 * Performs stat card operation
 *
 * @param {Icon, label, value, subtitle }} { icon - The { icon
 *
 * @returns {any} The statcard result
 */

function StatCard({ icon: Icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * CategoryStats Component
 *
 * Displays key category statistics and information.
 * Used on category detail pages.
 *
 * Features:
 * - Product count
 * - Number of sellers
 * - Price range display
 * - Average product rating
 * - Popular brands in category
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <CategoryStats
 *   productCount={1250}
 *   sellerCount={45}
 *   priceRange={{ min: 1000, max: 50000 }}
 *   averageRating={4.2}
 *   popularBrands={["Samsung", "Apple", "Sony"]}
 * />
 * ```
 */
/**
 * Performs category stats operation
 *
 * @returns {any} The categorystats result
 *
 * @example
 * CategoryStats();
 */

/**
 * Performs category stats operation
 *
 * @returns {any} The categorystats result
 *
 * @example
 * CategoryStats();
 */

export function CategoryStats({
  productCount,
  sellerCount,
  priceRange,
  averageRating,
  popularBrands = [],
  className = "",
}: CategoryStatsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={productCount.toLocaleString()}
        />

        <StatCard
          icon={Store}
          label="Active Sellers"
          value={sellerCount.toLocaleString()}
        />

        <StatCard
          icon={Tag}
          label="Price Range"
          value={
            <div className="flex items-baseline gap-1">
              <Price amount={priceRange.min} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                -
              </span>
              <Price amount={priceRange.max} />
            </div>
          }
        />

        {averageRating !== undefined && (
          <StatCard
            icon={Star}
            label="Average Rating"
            value={`${averageRating.toFixed(1)} ★`}
            subtitle="Based on all products"
          />
        )}
      </div>

      {/* Popular Brands */}
      {popularBrands.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Popular Brands
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularBrands.slice(0, 10).map((brand) => (
              <span
                key={brand}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryStats;
