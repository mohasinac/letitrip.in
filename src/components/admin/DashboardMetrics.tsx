"use client";

import { AdminStats, AdminAnalytics } from "@/lib/services/admin.service";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface DashboardMetricsProps {
  stats: AdminStats | null;
  analytics: AdminAnalytics | null;
  loading: boolean;
  period: "7d" | "30d" | "90d" | "1y";
}

export default function DashboardMetrics({
  stats,
  analytics,
  loading,
  period,
}: DashboardMetricsProps) {
  if (!stats && !analytics && loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats && !analytics) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getHealthStatus = () => {
    if (!stats) return { status: "unknown", message: "No data available" };

    const alerts = [];
    if (stats.lowStockProducts > 10)
      alerts.push(`${stats.lowStockProducts} products low in stock`);
    if (stats.pendingOrders > 50)
      alerts.push(`${stats.pendingOrders} orders pending`);
    if (stats.revenueChange < -20) alerts.push("Revenue dropped significantly");

    if (alerts.length === 0) {
      return { status: "healthy", message: "All systems operating normally" };
    } else if (alerts.length <= 2) {
      return {
        status: "warning",
        message: `${alerts.length} issue${
          alerts.length > 1 ? "s" : ""
        } need attention`,
      };
    } else {
      return {
        status: "critical",
        message: `${alerts.length} critical issues detected`,
      };
    }
  };

  const healthStatus = getHealthStatus();

  const metrics = [
    {
      label: "Average Order Value",
      value: stats
        ? formatCurrency(stats.totalRevenue / Math.max(stats.totalOrders, 1))
        : "₹0",
      change: null,
      description: "Revenue per order",
    },
    {
      label: "Products Sold",
      value: stats ? formatNumber(stats.productsSold || 0) : "0",
      change: null,
      description: "Total units sold",
    },
    {
      label: "Conversion Rate",
      value: "3.2%", // This would come from analytics
      change: 0.3,
      description: "Visitors to customers",
    },
    {
      label: "System Health",
      value:
        healthStatus.status === "healthy"
          ? "Healthy"
          : healthStatus.status === "warning"
          ? "Warning"
          : "Critical",
      change: null,
      description: healthStatus.message,
      status: healthStatus.status,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Dashboard Overview
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <span className="capitalize">{period}</span>
            {loading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const StatusIcon = metric.status
              ? getStatusIcon(metric.status)
              : null;

            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {metric.label}
                  </span>
                  {StatusIcon && (
                    <StatusIcon className="w-4 h-4 ml-1 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-center mb-1">
                  <span
                    className={`text-2xl font-bold ${
                      metric.status
                        ? getStatusColor(metric.status).split(" ")[0]
                        : "text-gray-900"
                    }`}
                  >
                    {metric.value}
                  </span>
                  {metric.change !== null && (
                    <div className="ml-2 flex items-center">
                      {metric.change >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          metric.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 max-w-32 mx-auto">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Alerts Section */}
        {stats && (stats.lowStockProducts > 0 || stats.pendingOrders > 10) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Alerts & Actions Needed
            </h4>
            <div className="space-y-2">
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.lowStockProducts} products are running low on stock
                    </p>
                    <p className="text-xs text-yellow-600">
                      Review inventory and reorder soon
                    </p>
                  </div>
                </div>
              )}
              {stats.pendingOrders > 10 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      {stats.pendingOrders} orders are awaiting processing
                    </p>
                    <p className="text-xs text-blue-600">
                      Process orders to maintain customer satisfaction
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
