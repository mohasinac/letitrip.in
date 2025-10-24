"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  totalPageViews: number;
  conversionRate: number;
  userGrowth: {
    period: string;
    growth: number;
  };
  revenueGrowth: {
    period: string;
    growth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  monthlyData: Array<{
    month: string;
    orders: number;
    revenue: number;
    users: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: number;
    changeType?: "positive" | "negative";
  }) => (
    <div className="admin-card p-6 -sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary">{title}</p>
          <p className="text-3xl font-bold text-primary">{value}</p>
          {change !== undefined && (
            <div
              className={`flex items-center mt-2 text-sm ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className="p-3 bg-red-50 rounded-full">
          <Icon className="h-8 w-8 text-red-600" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Analytics & Reports
              </h1>
              <p className="mt-1 text-sm text-muted">
                Track site performance and business metrics
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={data?.totalUsers.toLocaleString() || "0"}
            icon={UsersIcon}
            change={data?.userGrowth.growth}
            changeType={
              data?.userGrowth.growth && data.userGrowth.growth > 0
                ? "positive"
                : "negative"
            }
          />
          <StatCard
            title="Total Orders"
            value={data?.totalOrders.toLocaleString() || "0"}
            icon={ShoppingBagIcon}
          />
          <StatCard
            title="Revenue"
            value={`$${data?.totalRevenue.toLocaleString() || "0"}`}
            icon={CurrencyDollarIcon}
            change={data?.revenueGrowth.growth}
            changeType={
              data?.revenueGrowth.growth && data.revenueGrowth.growth > 0
                ? "positive"
                : "negative"
            }
          />
          <StatCard
            title="Reviews"
            value={data?.totalReviews.toLocaleString() || "0"}
            icon={StarIcon}
          />
          <StatCard
            title="Page Views"
            value={data?.totalPageViews.toLocaleString() || "0"}
            icon={EyeIcon}
          />
          <StatCard
            title="Conversion Rate"
            value={`${data?.conversionRate.toFixed(1) || "0"}%`}
            icon={ChartBarIcon}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance Chart */}
          <div className="admin-card p-6 -sm border">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Monthly Performance
            </h3>
            <div className="h-64 flex items-center justify-center text-muted">
              {/* This would be replaced with an actual chart component */}
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Chart showing monthly orders, revenue, and users</p>
                <p className="text-sm">(Chart component integration needed)</p>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="admin-card p-6 -sm border">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Traffic Sources
            </h3>
            <div className="space-y-4">
              {data?.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-600 mr-3"></div>
                    <span className="text-sm font-medium text-secondary">
                      {source.source}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary">
                      {source.visitors.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted py-8">
                  <EyeIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>No traffic data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-primary">
              Top Performing Products
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {data?.topProducts.length ? (
                  data.topProducts.map((product, index) => (
                    <tr key={product.id} className="hover: bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {product.sales.toLocaleString()} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        ${product.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-muted"
                    >
                      No product data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
