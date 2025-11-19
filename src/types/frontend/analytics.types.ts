/**
 * Analytics Types
 * Frontend type definitions for analytics and reporting
 */

/**
 * Filters for analytics queries
 */
export interface AnalyticsFiltersFE {
  /** Filter by specific shop */
  shopId?: string;
  /** Start date for analytics period (ISO string) */
  startDate?: string;
  /** End date for analytics period (ISO string) */
  endDate?: string;
  /** Predefined period for analytics */
  period?: "day" | "week" | "month" | "year";
}

/**
 * Analytics overview with key metrics
 */
export interface AnalyticsOverviewFE {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

/**
 * Time series data point for sales analytics
 */
export interface SalesDataPointFE {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

/**
 * Top performing product analytics
 */
export interface TopProductFE {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  views: number;
}

/**
 * Category performance metrics
 */
export interface CategoryPerformanceFE {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  products: number;
}

/**
 * Customer analytics data
 */
export interface CustomerAnalyticsFE {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

/**
 * Product performance metrics
 */
export interface ProductPerformanceFE {
  productId: string;
  productName: string;
  views: number;
  clicks: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
}

/**
 * Shop analytics overview
 */
export interface ShopAnalyticsFE {
  shopId: string;
  shopName: string;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
  averageRating: number;
  totalReviews: number;
}

/**
 * Traffic analytics data
 */
export interface TrafficAnalyticsFE {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
}

/**
 * Revenue breakdown by category or time period
 */
export interface RevenueBreakdownFE {
  label: string;
  revenue: number;
  percentage: number;
  orders: number;
}

/**
 * Export format for analytics data
 */
export type AnalyticsExportFormat = "csv" | "json" | "xlsx";

/**
 * Export options for analytics data
 */
export interface AnalyticsExportOptions {
  format: AnalyticsExportFormat;
  filters?: AnalyticsFiltersFE;
  includeCharts?: boolean;
}
