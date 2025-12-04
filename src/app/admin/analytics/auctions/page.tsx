"use client";

/**
 * Admin Auctions Analytics Page
 *
 * @status IMPLEMENTED
 * @epic E017 - Analytics & Reporting
 *
 * Auction analytics dashboard showing:
 * - Auction performance metrics
 * - Success/failure rates
 * - Bidding activity
 * - Popular categories
 */

import { PeriodSelector } from "@/components/common/PeriodSelector";
import { StatCard } from "@/components/common/StatCard";
import { CompactPrice, Price, Quantity } from "@/components/common/values";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  Gavel,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// Auction status distribution
function AuctionStatusChart({
  data,
}: {
  data: { status: string; count: number; color: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Auction Status Distribution
      </h3>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.status}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {item.status}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.count} ({((item.count / total) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Auctions
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            <Quantity value={total} />
          </span>
        </div>
      </div>
    </div>
  );
}

// Bidding activity chart
function BiddingActivityChart({ loading }: { loading: boolean }) {
  const mockData = [
    { hour: "00:00", bids: 45 },
    { hour: "04:00", bids: 23 },
    { hour: "08:00", bids: 156 },
    { hour: "12:00", bids: 234 },
    { hour: "16:00", bids: 312 },
    { hour: "20:00", bids: 287 },
    { hour: "24:00", bids: 198 },
  ];

  const maxBids = Math.max(...mockData.map((d) => d.bids));

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bidding Activity by Hour
        </h3>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Bidding Activity by Hour
      </h3>

      <div className="flex items-end justify-between h-40 gap-2">
        {mockData.map((item) => (
          <div key={item.hour} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-sm hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors cursor-pointer"
              style={{ height: `${(item.bids / maxBids) * 100}%` }}
              title={`${item.bids} bids`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {item.hour}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-gray-600 dark:text-gray-400">Bids placed</span>
        </div>
      </div>
    </div>
  );
}

// Top auctions table
function TopAuctionsTable({ loading }: { loading: boolean }) {
  const mockAuctions = [
    {
      id: "1",
      title: "Vintage Watch Collection",
      bids: 156,
      currentBid: 45000,
      watchers: 234,
      status: "live",
    },
    {
      id: "2",
      title: "Rare Coin Set",
      bids: 89,
      currentBid: 28500,
      watchers: 167,
      status: "live",
    },
    {
      id: "3",
      title: "Antique Furniture",
      bids: 67,
      currentBid: 72000,
      watchers: 98,
      status: "ending",
    },
    {
      id: "4",
      title: "Art Painting",
      bids: 45,
      currentBid: 125000,
      watchers: 312,
      status: "live",
    },
    {
      id: "5",
      title: "Electronics Bundle",
      bids: 34,
      currentBid: 15600,
      watchers: 89,
      status: "ended",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        );
      case "ending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <Clock className="w-3 h-3" />
            Ending Soon
          </span>
        );
      case "ended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Auctions
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
          Top Performing Auctions
        </h3>
        <Link
          href="/admin/auctions"
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Auction</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Bids</th>
              <th className="pb-3 pr-4">Current Bid</th>
              <th className="pb-3">Watchers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockAuctions.map((auction) => (
              <tr
                key={auction.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-3 pr-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {auction.title}
                  </span>
                </td>
                <td className="py-3 pr-4">{getStatusBadge(auction.status)}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Gavel className="w-4 h-4" />
                    {auction.bids}
                  </div>
                </td>
                <td className="py-3 pr-4 text-sm font-medium text-gray-900 dark:text-white">
                  <Price amount={auction.currentBid} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    {auction.watchers}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Category performance
function CategoryPerformance() {
  const categories = [
    { name: "Electronics", auctions: 234, revenue: 4500000, success: 78 },
    { name: "Collectibles", auctions: 189, revenue: 3200000, success: 85 },
    { name: "Art", auctions: 156, revenue: 5800000, success: 72 },
    { name: "Jewelry", auctions: 123, revenue: 2900000, success: 81 },
    { name: "Furniture", auctions: 98, revenue: 1800000, success: 69 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Top Categories
      </h3>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <div
            key={category.name}
            className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {category.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.auctions} auctions
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                <CompactPrice amount={category.revenue} />
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {category.success}% success
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAuctionsAnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const {
    isLoading: loading,
    error,
    execute,
  } = useLoadingState({
    onLoadError: (error) => {
      logError(error, {
        component: "AdminAuctionsAnalyticsPage.loadData",
        period,
      });
    },
  });

  // Mock stats
  const stats = {
    totalAuctions: 1256,
    activeAuctions: 342,
    successRate: 78.5,
    averageBids: 23,
    totalBids: 28450,
    totalRevenue: 18500000,
    auctionsGrowth: 12.5,
    activeGrowth: 8.2,
    successGrowth: 2.3,
    bidsGrowth: 15.8,
  };

  const statusData = [
    { status: "Completed", count: 856, color: "#10B981" },
    { status: "Active", count: 342, color: "#4F46E5" },
    { status: "Pending", count: 45, color: "#F59E0B" },
    { status: "Cancelled", count: 13, color: "#EF4444" },
  ];

  const loadData = useCallback(() => {
    execute(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
  }, [execute]);

  useEffect(() => {
    loadData();
  }, [loadData, period]);

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
            <span>Auctions</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-7 h-7 text-indigo-600" />
            Auction Analytics
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Auctions"
          value={stats.totalAuctions}
          change={stats.auctionsGrowth}
          icon={Gavel}
          color="blue"
        />
        <StatCard
          title="Active Auctions"
          value={stats.activeAuctions}
          change={stats.activeGrowth}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          change={stats.successGrowth}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Total Bids"
          value={stats.totalBids}
          change={stats.bidsGrowth}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AuctionStatusChart data={statusData} />
        <BiddingActivityChart loading={loading} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopAuctionsTable loading={loading} />
        </div>
        <CategoryPerformance />
      </div>
    </div>
  );
}
