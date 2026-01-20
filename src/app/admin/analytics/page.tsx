"use client";

import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminAnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            System Management
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <AdminNav />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics & Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Platform analytics and performance metrics
            </p>
          </div>

          {/* Date Range */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹54,328,750
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                +12% from last period
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                3,421
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                +8% from last period
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                12,458
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                +15% from last period
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Conversion Rate
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                3.2%
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                -2% from last period
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Trend
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                📈 Chart will be displayed here
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Categories
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                📊 Chart will be displayed here
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Performing Products
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                Product performance data will be displayed here
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
