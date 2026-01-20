"use client";

import { SellerNav } from "@/components/seller/SellerNav";
import { usePathname } from "next/navigation";

export default function SellerAnalyticsPage() {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Seller Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage Your Shop
          </p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <SellerNav currentPath={pathname} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Shop Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your shop's performance and sales metrics
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Sales
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹4,50,000
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
                156
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                +8% from last period
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Order Value
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₹2,885
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                +5% from last period
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Shop Views
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                2,341
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                +18% from last period
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sales Trend
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                📈 Chart will be displayed here
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Product Performance
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                📊 Chart will be displayed here
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Selling Products
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                {
                  name: "Samsung Galaxy S23",
                  sales: 45,
                  revenue: 3374955,
                },
                {
                  name: "Sony WH-1000XM5",
                  sales: 38,
                  revenue: 1139620,
                },
                {
                  name: "Apple Watch Series 9",
                  sales: 32,
                  revenue: 1468800,
                },
              ].map((product, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.sales} units sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ₹{product.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
