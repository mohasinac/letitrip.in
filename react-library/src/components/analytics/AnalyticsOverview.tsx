import type { ReactNode } from "react";
import { StatsCard } from "../cards/StatsCard";

/**
 * Analytics data structure for the overview component
 */
export interface AnalyticsOverviewData {
  /** Revenue metrics */
  revenue: {
    /** Total revenue amount */
    total: number;
    /** Average revenue amount */
    average: number;
    /** Revenue trend percentage (positive or negative) */
    trend: number;
  };
  /** Order metrics */
  orders: {
    /** Total number of orders */
    total: number;
    /** Number of pending orders */
    pending: number;
    /** Number of completed orders */
    completed: number;
    /** Number of cancelled orders */
    cancelled: number;
  };
  /** Product metrics */
  products: {
    /** Total number of products */
    total: number;
    /** Number of active products */
    active: number;
    /** Number of out-of-stock products */
    outOfStock: number;
  };
  /** Customer metrics */
  customers: {
    /** Total number of customers */
    total: number;
    /** Number of new customers */
    new: number;
    /** Number of returning customers */
    returning: number;
  };
  /** Conversion rate percentage */
  conversionRate: number;
  /** Average order value amount */
  averageOrderValue: number;
}

export interface AnalyticsOverviewProps {
  /**
   * Analytics data to display
   */
  data: AnalyticsOverviewData;
  /**
   * Function to format currency values
   * @default (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
   */
  formatCurrency?: (amount: number) => string;
  /**
   * Custom icons for stats cards (optional)
   */
  icons?: {
    revenue?: ReactNode;
    orders?: ReactNode;
    products?: ReactNode;
    customers?: ReactNode;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Column configuration for responsive grid
   * @default "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
   */
  gridCols?: string;
}

/**
 * AnalyticsOverview - Display key analytics metrics in stat cards
 *
 * A pure React component that displays analytics data including revenue, orders,
 * products, and customers using stat cards with icons and trends.
 *
 * @example
 * ```tsx
 * const data = {
 *   revenue: { total: 100000, average: 5000, trend: 15 },
 *   orders: { total: 50, pending: 5, completed: 40, cancelled: 5 },
 *   products: { total: 100, active: 95, outOfStock: 5 },
 *   customers: { total: 200, new: 50, returning: 150 },
 *   conversionRate: 2.5,
 *   averageOrderValue: 2000
 * };
 *
 * <AnalyticsOverview data={data} />
 * ```
 */
export function AnalyticsOverview({
  data,
  formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  },
  icons,
  className = "",
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
}: AnalyticsOverviewProps) {
  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(data.revenue.total)}
        icon={icons?.revenue}
        trend={
          data.revenue.trend !== 0
            ? {
                value: Math.abs(data.revenue.trend),
                isPositive: data.revenue.trend > 0,
              }
            : undefined
        }
      />

      <StatsCard
        title="Total Orders"
        value={data.orders.total.toString()}
        icon={icons?.orders}
        description={`${data.orders.completed} completed, ${data.orders.pending} pending`}
      />

      <StatsCard
        title="Active Products"
        value={data.products.active.toString()}
        icon={icons?.products}
        description={`${data.products.outOfStock} out of stock`}
      />

      <StatsCard
        title="Total Customers"
        value={data.customers.total.toString()}
        icon={icons?.customers}
        description={`${data.conversionRate.toFixed(1)}% conversion rate`}
      />
    </div>
  );
}
