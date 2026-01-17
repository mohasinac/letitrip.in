"use client";

import {
  Tag,
  Users,
  Store,
  Package,
  Gavel,
  DollarSign,
  Star,
  ShoppingCart,
  CreditCard,
  Truck,
  Image,
  Heart,
  Bell,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { DateDisplay } from "@letitrip/react-library";
import { ExtendedSummary } from "./types";

interface MiniStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
  value: number;
}

function MiniStatCard({
  icon: Icon,
  color,
  bgColor,
  label,
  value,
}: MiniStatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

interface DemoStatsProps {
  summary: ExtendedSummary | null;
  generating: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DemoStats({
  summary,
  generating,
  refreshing,
  onRefresh,
}: DemoStatsProps) {
  const totalRecords =
    (summary?.categories || 0) +
    (summary?.users || 0) +
    (summary?.shops || 0) +
    (summary?.products || 0) +
    (summary?.auctions || 0) +
    (summary?.bids || 0) +
    (summary?.orders || 0) +
    (summary?.payments || 0) +
    (summary?.shipments || 0) +
    (summary?.reviews || 0) +
    (summary?.heroSlides || 0) +
    (summary?.favorites || 0) +
    (summary?.carts || 0) +
    (summary?.notifications || 0);

  return (
    <div className="xl:sticky xl:top-6 xl:self-start space-y-6">
      {/* Current Demo Data Stats */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            📊 Live Data Stats
          </h2>
          <div className="flex items-center gap-2">
            {(generating || refreshing) && (
              <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={refreshing || generating}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MiniStatCard
            icon={Tag}
            color="text-purple-600"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
            label="Categories"
            value={summary?.categories || 0}
          />
          <MiniStatCard
            icon={Users}
            color="text-green-600"
            bgColor="bg-green-50 dark:bg-green-900/20"
            label="Users"
            value={summary?.users || 0}
          />
          <MiniStatCard
            icon={Store}
            color="text-blue-600"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            label="Shops"
            value={summary?.shops || 0}
          />
          <MiniStatCard
            icon={Package}
            color="text-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
            label="Products"
            value={summary?.products || 0}
          />
          <MiniStatCard
            icon={Gavel}
            color="text-red-600"
            bgColor="bg-red-50 dark:bg-red-900/20"
            label="Auctions"
            value={summary?.auctions || 0}
          />
          <MiniStatCard
            icon={DollarSign}
            color="text-yellow-600"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            label="Bids"
            value={summary?.bids || 0}
          />
          <MiniStatCard
            icon={ShoppingCart}
            color="text-indigo-600"
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            label="Orders"
            value={summary?.orders || 0}
          />
          <MiniStatCard
            icon={CreditCard}
            color="text-emerald-600"
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            label="Payments"
            value={summary?.payments || 0}
          />
          <MiniStatCard
            icon={Truck}
            color="text-cyan-600"
            bgColor="bg-cyan-50 dark:bg-cyan-900/20"
            label="Shipments"
            value={summary?.shipments || 0}
          />
          <MiniStatCard
            icon={Star}
            color="text-amber-600"
            bgColor="bg-amber-50 dark:bg-amber-900/20"
            label="Reviews"
            value={summary?.reviews || 0}
          />
          <MiniStatCard
            icon={Image}
            color="text-sky-600"
            bgColor="bg-sky-50 dark:bg-sky-900/20"
            label="Hero Slides"
            value={summary?.heroSlides || 0}
          />
          <MiniStatCard
            icon={Heart}
            color="text-rose-600"
            bgColor="bg-rose-50 dark:bg-rose-900/20"
            label="Favorites"
            value={summary?.favorites || 0}
          />
          <MiniStatCard
            icon={ShoppingCart}
            color="text-orange-500"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
            label="Carts"
            value={summary?.carts || 0}
          />
          <MiniStatCard
            icon={Bell}
            color="text-yellow-500"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            label="Notifications"
            value={summary?.notifications || 0}
          />
        </div>

        {/* Generated At */}
        {summary && summary.categories > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generated: <DateDisplay date={summary.createdAt} includeTime />
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="font-semibold mb-3">Total Records</h3>
        <p className="text-4xl font-bold mb-2">
          {totalRecords.toLocaleString()}
        </p>
        <p className="text-sm opacity-80">Across all collections</p>
      </div>
    </div>
  );
}
