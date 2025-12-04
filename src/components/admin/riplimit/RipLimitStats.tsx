"use client";

import { Quantity } from "@/components/common/values";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, DollarSign, Users, Wallet } from "lucide-react";

interface RipLimitStats {
  totalCirculation: number;
  totalAvailable: number;
  totalBlocked: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  userCount: number;
  unpaidUserCount: number;
}

interface RipLimitStatsProps {
  stats: RipLimitStats | null;
  loading: boolean;
}

export function RipLimitStatsCards({ stats, loading }: RipLimitStatsProps) {
  const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
  const formatRL = (amount: number) => `${amount.toLocaleString("en-IN")} RL`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Circulation */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Total Circulation
            </p>
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatRL(stats?.totalCirculation || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ≈ {formatINR(stats?.totalCirculation || 0)}
                </p>
              </>
            )}
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Net Revenue */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Net Revenue
            </p>
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatINR(stats?.netRevenue || 0)}
                </p>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>↑ {formatINR(stats?.totalRevenue || 0)}</span>
                  <span>↓ {formatINR(stats?.totalRefunded || 0)}</span>
                </div>
              </>
            )}
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Active Users */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Active Users
            </p>
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  <Quantity value={stats?.userCount || 0} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  with RipLimit accounts
                </p>
              </>
            )}
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </Card>

      {/* Unpaid Auctions */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Unpaid Auctions
            </p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
            ) : (
              <>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    (stats?.unpaidUserCount || 0) > 0
                      ? "text-red-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {stats?.unpaidUserCount || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  users with unpaid wins
                </p>
              </>
            )}
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
