/**
 * Reusable Analytics Component
 * Can be used by both Admin and Seller with different contexts
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Download,
  Package,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { apiGet } from "@/lib/api/seller";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { UnifiedButton } from "@/components/ui/unified/Button";
import Link from "next/link";

interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueChange?: number; // Percentage change
  ordersChange?: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  threshold: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  topSellers?: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
}

interface AnalyticsProps {
  /**
   * Context: 'admin' or 'seller'
   */
  context: "admin" | "seller";

  /**
   * Page title
   */
  title: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Breadcrumbs
   */
  breadcrumbs: Array<{ label: string; href?: string; active?: boolean }>;
}

export function Analytics({
  context,
  title,
  description,
  breadcrumbs,
}: AnalyticsProps) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);

      if (context === "admin") {
        // Fetch admin analytics from multiple endpoints
        const [ordersStats, productsStats] = await Promise.all([
          apiClient
            .get<any>("/api/admin/orders/stats")
            .catch(() => ({ total: 0, totalRevenue: 0 })),
          apiClient
            .get<any>("/api/admin/products/stats")
            .catch(() => ({ total: 0 })),
        ]);

        // Mock top sellers and products for admin (TODO: Implement actual endpoint)
        setData({
          overview: {
            totalRevenue: ordersStats?.totalRevenue || 0,
            totalOrders: ordersStats?.total || 0,
            averageOrderValue: ordersStats?.avgOrderValue || 0,
            totalCustomers: ordersStats?.totalSellers || 0,
            revenueChange: 12.5,
            ordersChange: 8.3,
          },
          topProducts: [],
          recentOrders: [],
          lowStockProducts: [],
          topSellers: [],
        });
      } else {
        // Fetch seller analytics
        const response = await apiGet<{
          success: boolean;
          data?: AnalyticsData;
          error?: string;
        }>(`/api/seller/analytics/overview?period=${period}`);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || "Failed to load analytics");
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchAnalytics();
    }
  }, [user, authLoading, period, context]);

  const handleExport = () => {
    setError("Export feature coming soon!");
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, "success" | "warning" | "error" | "info"> =
      {
        pending: "warning",
        pending_approval: "warning",
        processing: "info",
        shipped: "info",
        delivered: "success",
        cancelled: "error",
      };
    return statusMap[status.toLowerCase()] || "warning";
  };

  // Loading state
  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">{title}</h1>
            {description && <p className="text-textSecondary">{description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <UnifiedCard key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-surface rounded w-24"></div>
                  <div className="h-8 bg-surface rounded w-32"></div>
                  <div className="h-3 bg-surface rounded w-20"></div>
                </div>
              </UnifiedCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">{title}</h1>
            {description && <p className="text-textSecondary">{description}</p>}
          </div>
          <UnifiedCard className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-textSecondary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">
              No data available
            </h2>
            <p className="text-textSecondary">
              Analytics will appear here once you have orders
            </p>
          </UnifiedCard>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Error Alert */}
        {error && (
          <UnifiedAlert
            variant="error"
            onClose={() => setError(null)}
            className="mb-6"
          >
            {error}
          </UnifiedAlert>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">{title}</h1>
            {description && <p className="text-textSecondary">{description}</p>}
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
              <option value="alltime">All Time</option>
            </select>

            <UnifiedButton
              variant="outline"
              icon={<Download />}
              onClick={handleExport}
            >
              Export
            </UnifiedButton>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <UnifiedCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-textSecondary">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-text mb-1">
              ₹{data.overview.totalRevenue.toLocaleString()}
            </p>
            {data.overview.revenueChange !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {data.overview.revenueChange >= 0 ? (
                  <ArrowUp className="w-3 h-3 text-success" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-error" />
                )}
                <span
                  className={
                    data.overview.revenueChange >= 0
                      ? "text-success"
                      : "text-error"
                  }
                >
                  {Math.abs(data.overview.revenueChange)}%
                </span>
                <span className="text-textSecondary">vs last period</span>
              </div>
            )}
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-textSecondary">Total Orders</p>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-text mb-1">
              {data.overview.totalOrders.toLocaleString()}
            </p>
            {data.overview.ordersChange !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {data.overview.ordersChange >= 0 ? (
                  <ArrowUp className="w-3 h-3 text-success" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-error" />
                )}
                <span
                  className={
                    data.overview.ordersChange >= 0
                      ? "text-success"
                      : "text-error"
                  }
                >
                  {Math.abs(data.overview.ordersChange)}%
                </span>
                <span className="text-textSecondary">vs last period</span>
              </div>
            )}
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-textSecondary">Avg. Order Value</p>
              <TrendingUp className="w-5 h-5 text-info" />
            </div>
            <p className="text-3xl font-bold text-text">
              ₹{data.overview.averageOrderValue.toLocaleString()}
            </p>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-textSecondary">
                {context === "admin" ? "Total Sellers" : "Total Customers"}
              </p>
              <Users className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-text">
              {data.overview.totalCustomers.toLocaleString()}
            </p>
          </UnifiedCard>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <UnifiedCard>
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text">Top Products</h2>
            </div>
            <div className="p-6">
              {data.topProducts && data.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {data.topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-text">{product.name}</p>
                        <p className="text-sm text-textSecondary">
                          {product.sales} sales
                        </p>
                      </div>
                      <p className="font-semibold text-text">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-textSecondary mx-auto mb-3" />
                  <p className="text-sm text-textSecondary">
                    No top products data yet
                  </p>
                </div>
              )}
            </div>
          </UnifiedCard>

          {/* Low Stock Products or Top Sellers */}
          <UnifiedCard>
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text">
                {context === "admin" ? "Top Sellers" : "Low Stock Alerts"}
              </h2>
            </div>
            <div className="p-6">
              {context === "seller" && data.lowStockProducts ? (
                data.lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {data.lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-text">
                            {product.name}
                          </p>
                          <p className="text-sm text-textSecondary">
                            Threshold: {product.threshold}
                          </p>
                        </div>
                        <UnifiedBadge variant="error">
                          {product.stock} left
                        </UnifiedBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="text-sm text-textSecondary">
                      All products well stocked
                    </p>
                  </div>
                )
              ) : context === "admin" && data.topSellers ? (
                data.topSellers.length > 0 ? (
                  <div className="space-y-4">
                    {data.topSellers.map((seller) => (
                      <div
                        key={seller.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-text">{seller.name}</p>
                          <p className="text-sm text-textSecondary">
                            {seller.orders} orders
                          </p>
                        </div>
                        <p className="font-semibold text-text">
                          ₹{seller.revenue.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-textSecondary mx-auto mb-3" />
                    <p className="text-sm text-textSecondary">
                      No seller data yet
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-textSecondary">
                    No data available
                  </p>
                </div>
              )}
            </div>
          </UnifiedCard>
        </div>

        {/* Recent Orders */}
        <UnifiedCard>
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            {data.recentOrders && data.recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/${context}/orders/${order.id}`}
                          className="text-primary hover:text-primary/80 font-medium no-underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UnifiedBadge variant={getStatusColor(order.status)}>
                          {order.status.replace("_", " ")}
                        </UnifiedBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-textSecondary mx-auto mb-3" />
                <p className="text-sm text-textSecondary">No recent orders</p>
              </div>
            )}
          </div>
        </UnifiedCard>
      </div>
    </div>
  );
}
