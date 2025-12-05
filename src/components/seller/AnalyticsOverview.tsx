/**
 * @fileoverview React Component
 * @module src/components/seller/AnalyticsOverview
 * @description This file contains the AnalyticsOverview component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";

/**
 * AnalyticsData interface
 * 
 * @interface
 * @description Defines the structure and contract for AnalyticsData
 */
interface AnalyticsData {
  /** Revenue */
  revenue: { total: number; average: number; trend: number };
  /** Orders */
  orders: {
    /** Total */
    total: number;
    /** Pending */
    pending: number;
    /** Completed */
    completed: number;
    /** Cancelled */
    cancelled: number;
  };
  /** Products */
  products: { total: number; active: number; outOfStock: number };
  /** Customers */
  customers: { total: number; new: number; returning: number };
  /** Conversion Rate */
  conversionRate: number;
  /** Average Order Value */
  averageOrderValue: number;
}

/**
 * Props interface
 * 
 * @interface
 * @description Defines the structure and contract for Props
 */
interface Props {
  /** Data */
  data: AnalyticsData;
}

export default function AnalyticsOverview({ data }: Props) {
  /**
   * Formats currency
   *
   * @param {number} amount - The amount
   *
   * @returns {number} The formatcurrency result
   */

  /**
   * Formats currency
   *
   * @param {number} amount - The amount
   *
   * @returns {number} The formatcurrency result
   */

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      /** Style */
      style: "currency",
      /** Currency */
      currency: "INR",
      /** Maximum Fraction Digits */
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(data.revenue.total)}
        icon={<DollarSign className="w-6 h-6" />}
        trend={
          data.revenue.trend !== 0
            ? {
                /** Value */
                value: Math.abs(data.revenue.trend),
                /** Is Positive */
                isPositive: data.revenue.trend > 0,
              }
            : undefined
        }
      />

      <StatsCard
        title="Total Orders"
        value={data.orders.total.toString()}
        icon={<ShoppingBag className="w-6 h-6" />}
        description={`${data.orders.completed} completed, ${data.orders.pending} pending`}
      />

      <StatsCard
        title="Active Products"
        value={data.products.active.toString()}
        icon={<Package className="w-6 h-6" />}
        description={`${data.products.outOfStock} out of stock`}
      />

      <StatsCard
        title="Total Customers"
        value={data.customers.total.toString()}
        icon={<Users className="w-6 h-6" />}
        description={`${data.conversionRate.toFixed(1)}% conversion rate`}
      />
    </div>
  );
}
