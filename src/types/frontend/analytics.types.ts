/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/analytics.types
 * @description This file contains TypeScript type definitions for analytics
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Total Revenue */
  totalRevenue: number;
  /** Total Orders */
  totalOrders: number;
  /** Total Products */
  totalProducts: number;
  /** Total Customers */
  totalCustomers: number;
  /** Average Order Value */
  averageOrderValue: number;
  /** Conversion Rate */
  conversionRate: number;
  /** Revenue Growth */
  revenueGrowth: number;
  /** Orders Growth */
  ordersGrowth: number;
}

/**
 * Time series data point for sales analytics
 */
export interface SalesDataPointFE {
  /** Date */
  date: string;
  /** Revenue */
  revenue: number;
  /** Orders */
  orders: number;
  /** Customers */
  customers: number;
}

/**
 * Top performing product analytics
 */
export interface TopProductFE {
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Sales */
  sales: number;
  /** Revenue */
  revenue: number;
  /** Views */
  views: number;
}

/**
 * Category performance metrics
 */
export interface CategoryPerformanceFE {
  /** Category Id */
  categoryId: string;
  /** Category Name */
  categoryName: string;
  /** Revenue */
  revenue: number;
  /** Orders */
  orders: number;
  /** Products */
  products: number;
}

/**
 * Customer analytics data
 */
export interface CustomerAnalyticsFE {
  /** Customer Id */
  customerId: string;
  /** Customer Name */
  customerName: string;
  /** Total Orders */
  totalOrders: number;
  /** Total Spent */
  totalSpent: number;
  /** Average Order Value */
  averageOrderValue: number;
  /** Last Order Date */
  lastOrderDate: string;
}

/**
 * Product performance metrics
 */
export interface ProductPerformanceFE {
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Views */
  views: number;
  /** Clicks */
  clicks: number;
  /** Purchases */
  purchases: number;
  /** Revenue */
  revenue: number;
  /** Conversion Rate */
  conversionRate: number;
  /** Average Rating */
  averageRating: number;
}

/**
 * Shop analytics overview
 */
export interface ShopAnalyticsFE {
  /** Shop Id */
  shopId: string;
  /** Shop Name */
  shopName: string;
  /** Total Revenue */
  totalRevenue: number;
  /** Total Orders */
  totalOrders: number;
  /** Total Products */
  totalProducts: number;
  /** Active Products */
  activeProducts: number;
  /** Average Rating */
  averageRating: number;
  /** Total Reviews */
  totalReviews: number;
}

/**
 * Traffic analytics data
 */
export interface TrafficAnalyticsFE {
  /** Page Views */
  pageViews: number;
  /** Unique Visitors */
  uniqueVisitors: number;
  /** Bounce Rate */
  bounceRate: number;
  /** Average Session Duration */
  averageSessionDuration: number;
  /** Top Pages */
  topPages: Array<{
    /** Path */
    path: string;
    /** Views */
    views: number;
    /** Unique Visitors */
    uniqueVisitors: number;
  }>;
  /** Top Referrers */
  topReferrers: Array<{
    /** Source */
    source: string;
    /** Visits */
    visits: number;
  }>;
}

/**
 * Revenue breakdown by category or time period
 */
export interface RevenueBreakdownFE {
  /** Label */
  label: string;
  /** Revenue */
  revenue: number;
  /** Percentage */
  percentage: number;
  /** Orders */
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
  /** Format */
  format: AnalyticsExportFormat;
  /** Filters */
  filters?: AnalyticsFiltersFE;
  /** Include Charts */
  includeCharts?: boolean;
}
