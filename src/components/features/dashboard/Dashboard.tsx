/**
 * Reusable Dashboard Component
 * Can be used by both Admin and Seller dashboards with different contexts
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Package,
  Truck,
  DollarSign,
  ArrowRight,
  Store,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { apiGet } from "@/lib/api/seller";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import Link from "next/link";

interface DashboardStats {
  // Common stats
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;

  // Admin-specific stats
  totalUsers?: number;
  totalSellers?: number;
  totalProducts?: number;

  // Seller-specific stats
  myProducts?: number;
  deliveredOrders?: number;
  lowStockProducts?: number;

  // Trends
  ordersChange?: string;
  revenueChange?: string;
  usersChange?: string;
}

interface DashboardProps {
  /**
   * Context: 'admin' or 'seller'
   * Determines which stats and features to show
   */
  context: "admin" | "seller";

  /**
   * Title for the dashboard
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Routes for quick actions
   */
  routes?: {
    products?: string;
    orders?: string;
    users?: string;
    analytics?: string;
    shopSetup?: string;
    newProduct?: string;
    sales?: string;
  };
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  href,
  variant = "primary",
  loading = false,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  change?: string;
  href?: string;
  variant?: "primary" | "success" | "warning" | "error" | "info";
  loading?: boolean;
}) => {
  const variantColors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
  };

  return (
    <UnifiedCard className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-lg ${variantColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm text-textSecondary">{title}</p>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-surface rounded w-24 mb-2"></div>
          <div className="h-4 bg-surface rounded w-32"></div>
        </div>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-text mb-2">{value}</h3>
          <div className="flex justify-between items-center">
            {change && <p className="text-sm text-success">{change}</p>}
            {href && (
              <Link
                href={href}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 no-underline transition-colors"
              >
                View
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </>
      )}
    </UnifiedCard>
  );
};

export function Dashboard({
  context,
  title,
  description,
  routes = {},
}: DashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);

      if (context === "admin") {
        // Fetch admin stats from multiple endpoints
        const [ordersStats, productsStats] = await Promise.all([
          apiClient.get<any>("/api/admin/orders/stats").catch(() => ({
            total: 0,
            pending: 0,
            totalRevenue: 0,
          })),
          apiClient.get<any>("/api/admin/products/stats").catch(() => ({
            total: 0,
            totalSellers: 0,
          })),
        ]);

        setStats({
          totalOrders: ordersStats?.total || 0,
          pendingOrders: ordersStats?.pending || 0,
          totalRevenue: ordersStats?.totalRevenue || 0,
          thisMonthRevenue: ordersStats?.totalRevenue || 0, // TODO: Calculate current month
          totalProducts: productsStats?.total || 0,
          totalSellers: productsStats?.totalSellers || 0,
          ordersChange: "+12% from last month",
          revenueChange: "+22% from last month",
        });
      } else {
        // Fetch seller stats
        const [ordersResponse, productsResponse] = await Promise.all([
          apiGet<{ success: boolean; data: any[]; stats?: any }>(
            "/api/seller/orders"
          ).catch(() => ({ success: false, data: [], stats: {} })),
          apiGet<{ success: boolean; data: any[] }>(
            "/api/seller/products"
          ).catch(() => ({ success: false, data: [] })),
        ]);

        const ordersStats = ordersResponse.stats || {};
        const products = productsResponse.data || [];

        setStats({
          totalOrders: ordersStats.total || 0,
          pendingOrders:
            ordersStats.pendingApproval || ordersStats.pending || 0,
          totalRevenue: ordersStats.totalRevenue || 0,
          thisMonthRevenue: ordersStats.totalRevenue || 0, // TODO: Calculate current month
          myProducts: products.length,
          deliveredOrders: ordersStats.delivered || 0,
          lowStockProducts: products.filter(
            (p: any) => p.quantity <= p.lowStockThreshold
          ).length,
          ordersChange: "Get started by adding products",
          revenueChange: "Start selling to earn",
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchStats();
    }
  }, [user, authLoading, context]);

  // Admin stats configuration
  const adminStats = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      href: routes.orders,
      variant: "primary" as const,
    },
    {
      icon: Package,
      title: "Total Products",
      value: stats.totalProducts?.toLocaleString() || "0",
      change: `From ${stats.totalSellers || 0} sellers`,
      href: routes.products,
      variant: "info" as const,
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K`,
      change: stats.revenueChange,
      variant: "success" as const,
    },
    {
      icon: AlertTriangle,
      title: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      change: `${stats.pendingOrders} needs attention`,
      href: routes.orders,
      variant: "warning" as const,
    },
  ];

  // Seller stats configuration
  const sellerStats = [
    {
      icon: Package,
      title: "Total Products",
      value: stats.myProducts?.toLocaleString() || "0",
      change: stats.ordersChange,
      href: routes.products,
      variant: "primary" as const,
    },
    {
      icon: Truck,
      title: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      change:
        stats.pendingOrders > 0
          ? `${stats.pendingOrders} to process`
          : "No pending orders",
      href: routes.orders,
      variant: "warning" as const,
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      variant: "success" as const,
    },
    {
      icon: TrendingUp,
      title: "This Month",
      value: `₹${stats.thisMonthRevenue.toLocaleString()}`,
      change: stats.deliveredOrders
        ? `${stats.deliveredOrders} delivered`
        : "No sales yet",
      variant: "info" as const,
    },
  ];

  const statsToDisplay = context === "admin" ? adminStats : sellerStats;

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">{title}</h1>
          {description && <p className="text-textSecondary">{description}</p>}
        </div>

        {/* Quick Setup Guide (Seller Only) */}
        {context === "seller" && stats.myProducts === 0 && (
          <UnifiedCard className="mb-8 border-l-4 border-primary bg-primary/5">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text mb-2">
                🚀 Quick Setup Guide
              </h2>
              <p className="text-textSecondary mb-4">
                Follow these steps to start selling:
              </p>
              <ol className="pl-5 space-y-2">
                {routes.shopSetup && (
                  <li className="text-text">
                    <Link
                      href={routes.shopSetup}
                      className="font-semibold text-primary hover:text-primary/80 no-underline"
                    >
                      Setup your shop →
                    </Link>{" "}
                    Configure shop name, pickup addresses, and SEO
                  </li>
                )}
                {routes.newProduct && (
                  <li className="text-text">
                    <Link
                      href={routes.newProduct}
                      className="font-semibold text-primary hover:text-primary/80 no-underline"
                    >
                      Add your first product →
                    </Link>{" "}
                    Upload products with images and details
                  </li>
                )}
                {routes.sales && (
                  <li className="text-text">
                    <Link
                      href={routes.sales}
                      className="font-semibold text-primary hover:text-primary/80 no-underline"
                    >
                      Create a sale or coupon →
                    </Link>{" "}
                    Attract customers with discounts
                  </li>
                )}
              </ol>
            </div>
          </UnifiedCard>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {statsToDisplay.map((stat) => (
            <StatCard key={stat.title} {...stat} loading={loading} />
          ))}
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {context === "admin" ? (
            <>
              {routes.orders && (
                <Link href={routes.orders} className="no-underline">
                  <UnifiedCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold text-text">
                        Manage Orders
                      </h3>
                    </div>
                    <p className="text-textSecondary text-sm">
                      View and manage all platform orders
                    </p>
                  </UnifiedCard>
                </Link>
              )}
              {routes.products && (
                <Link href={routes.products} className="no-underline">
                  <UnifiedCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-6 h-6 text-info" />
                      <h3 className="text-lg font-semibold text-text">
                        Products Catalog
                      </h3>
                    </div>
                    <p className="text-textSecondary text-sm">
                      Manage products from all sellers
                    </p>
                  </UnifiedCard>
                </Link>
              )}
              {routes.analytics && (
                <Link href={routes.analytics} className="no-underline">
                  <UnifiedCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-success" />
                      <h3 className="text-lg font-semibold text-text">
                        Analytics
                      </h3>
                    </div>
                    <p className="text-textSecondary text-sm">
                      View platform performance metrics
                    </p>
                  </UnifiedCard>
                </Link>
              )}
            </>
          ) : (
            <>
              {routes.newProduct && (
                <Link href={routes.newProduct} className="no-underline">
                  <UnifiedCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold text-text">
                        Add Product
                      </h3>
                    </div>
                    <p className="text-textSecondary text-sm">
                      List a new product for sale
                    </p>
                  </UnifiedCard>
                </Link>
              )}
              {routes.orders && (
                <Link href={routes.orders} className="no-underline">
                  <UnifiedCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <ShoppingCart className="w-6 h-6 text-warning" />
                      <h3 className="text-lg font-semibold text-text">
                        View Orders
                      </h3>
                    </div>
                    <p className="text-textSecondary text-sm">
                      Manage your customer orders
                    </p>
                  </UnifiedCard>
                </Link>
              )}
              {routes.shopSetup && (
                <Link href={routes.shopSetup} className="no-underline">
                  <UnifiedCard className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="w-6 h-6 text-info" />
                      <h3 className="text-lg font-semibold text-text">
                        Shop Settings
                      </h3>
                    </div>
                    <p className="text-textSecondary text-sm">
                      Configure your shop details
                    </p>
                  </UnifiedCard>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
