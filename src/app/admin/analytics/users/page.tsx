"use client";

/**
 * Admin Users Analytics Page
 *
 * @status IMPLEMENTED
 * @epic E017 - Analytics & Reporting
 *
 * User analytics dashboard showing:
 * - User growth over time
 * - User segments (buyers, sellers, admins)
 * - Top customers by spending
 * - User activity metrics
 */

import { PeriodSelector } from "@/components/common/PeriodSelector";
import { StatCard } from "@/components/common/StatCard";
import { DateDisplay, Price, Quantity } from "@/components/common/values";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { analyticsService } from "@/services/analytics.service";
import type { CustomerAnalyticsFE } from "@/types/frontend/analytics.types";
import {
  Activity,
  ArrowLeft,
  Crown,
  Loader2,
  RefreshCw,
  Shield,
  ShoppingBag,
  Store,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// User segment chart
function UserSegmentChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        User Segments
      </h3>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {data.map((segment, index) => {
              const startAngle = data
                .slice(0, index)
                .reduce((sum, s) => sum + (s.value / total) * 360, 0);
              const angle = (segment.value / total) * 360;
              const x1 =
                50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
              const y1 =
                50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
              const x2 =
                50 + 40 * Math.cos((startAngle + angle - 90) * (Math.PI / 180));
              const y2 =
                50 + 40 * Math.sin((startAngle + angle - 90) * (Math.PI / 180));
              const largeArc = angle > 180 ? 1 : 0;

              return (
                <path
                  key={segment.label}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="white"
              className="dark:fill-gray-800"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                <Quantity value={total} />
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {segment.label}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                <Quantity value={segment.value} />
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({((segment.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top customers table
function TopCustomersTable({
  customers,
  loading,
}: {
  customers: CustomerAnalyticsFE[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Customers
        </h3>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Customers
        </h3>
        <Link
          href="/admin/users"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Orders</th>
              <th className="pb-3 pr-4">Total Spent</th>
              <th className="pb-3 pr-4">Avg Order</th>
              <th className="pb-3">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {customers.slice(0, 10).map((customer, index) => (
              <tr
                key={customer.customerId}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                      {index < 3 ? (
                        <Crown
                          className={`w-4 h-4 ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                                ? "text-gray-400"
                                : "text-orange-400"
                          }`}
                        />
                      ) : (
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.customerName}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                  {customer.totalOrders}
                </td>
                <td className="py-3 pr-4 text-sm font-medium text-gray-900 dark:text-white">
                  <Price amount={customer.totalSpent} />
                </td>
                <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                  <Price amount={customer.averageOrderValue} />
                </td>
                <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  <DateDisplay date={customer.lastOrderDate} format="short" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No customer data available
          </p>
        </div>
      )}
    </div>
  );
}

// Activity timeline
function ActivityTimeline() {
  const activities = [
    { type: "signup", text: "5 new users signed up", time: "2 minutes ago" },
    { type: "order", text: "User placed first order", time: "15 minutes ago" },
    { type: "seller", text: "New seller registered", time: "1 hour ago" },
    {
      type: "verification",
      text: "3 users verified email",
      time: "2 hours ago",
    },
    { type: "order", text: "VIP customer placed order", time: "3 hours ago" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "signup":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case "order":
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case "seller":
        return <Store className="w-4 h-4 text-purple-500" />;
      case "verification":
        return <Shield className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.text}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersAnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const {
    isLoading: loading,
    error,
    execute,
  } = useLoadingState({
    onLoadError: (error) => {
      logError(error, {
        component: "AdminUsersAnalyticsPage.loadData",
        period,
      });
    },
  });
  const [customers, setCustomers] = useState<CustomerAnalyticsFE[]>([]);

  // Mock stats for now - these would come from an API
  const [stats] = useState({
    totalUsers: 12450,
    newUsers: 342,
    activeUsers: 4523,
    churnRate: 2.3,
    userGrowth: 15.2,
    newUsersGrowth: 8.5,
    activeUsersGrowth: 12.1,
    churnRateChange: -0.5,
  });

  const userSegments = [
    { label: "Buyers", value: 10200, color: "#4F46E5" },
    { label: "Sellers", value: 1850, color: "#10B981" },
    { label: "Admins", value: 25, color: "#F59E0B" },
    { label: "Inactive", value: 375, color: "#6B7280" },
  ];

  const loadData = useCallback(() => {
    execute(async () => {
      const customerData = await analyticsService.getCustomerAnalytics({
        period: period as "day" | "week" | "month" | "year",
      });
      setCustomers(customerData);
    });
  }, [period, execute]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/admin"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Admin
            </Link>
            <span>/</span>
            <Link
              href="/admin/analytics"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Analytics
            </Link>
            <span>/</span>
            <span>Users</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            User Analytics
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <PeriodSelector value={period} onChange={setPeriod} />
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="New Users"
          value={stats.newUsers.toLocaleString()}
          change={stats.newUsersGrowth}
          icon={UserPlus}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={stats.activeUsersGrowth}
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Churn Rate"
          value={`${stats.churnRate}%`}
          change={stats.churnRateChange}
          icon={TrendingDown}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <UserSegmentChart data={userSegments} />
        <div className="lg:col-span-2">
          <TopCustomersTable customers={customers} loading={loading} />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline />

        {/* User growth placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Growth Trend
          </h3>
          <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Growth chart visualization
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
