"use client";

/**
 * Payments Analytics Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Display payment analytics with gateway breakdown, currency tracking, and transaction analysis.
 */

import AuthGuard from "@/components/auth/AuthGuard";
import { Price } from "@letitrip/react-library";
import { useLoadingState } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CreditCard,
  DollarSign,
  Globe,
  IndianRupee,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  gatewayBreakdown: {
    gatewayId: string;
    gatewayName: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }[];
  currencyBreakdown: {
    currency: string;
    revenue: number;
    revenueInINR: number;
    transactions: number;
    percentage: number;
  }[];
  internationalVsDomestic: {
    international: {
      revenue: number;
      transactions: number;
      percentage: number;
    };
    domestic: { revenue: number; transactions: number; percentage: number };
  };
  transactionFees: {
    totalFees: number;
    feesByGateway: {
      gatewayId: string;
      gatewayName: string;
      fees: number;
      percentage: number;
    }[];
  };
  trends: {
    revenueGrowth: number;
    transactionGrowth: number;
    avgOrderValueGrowth: number;
  };
}

const DEFAULT_STATS: PaymentStats = {
  totalRevenue: 0,
  totalTransactions: 0,
  averageOrderValue: 0,
  gatewayBreakdown: [],
  currencyBreakdown: [],
  internationalVsDomestic: {
    international: { revenue: 0, transactions: 0, percentage: 0 },
    domestic: { revenue: 0, transactions: 0, percentage: 0 },
  },
  transactionFees: {
    totalFees: 0,
    feesByGateway: [],
  },
  trends: {
    revenueGrowth: 0,
    transactionGrowth: 0,
    avgOrderValueGrowth: 0,
  },
};

export default function PaymentsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  const {
    data: stats,
    isLoading,
    error,
    execute,
  } = useLoadingState<PaymentStats>({
    initialData: DEFAULT_STATS,
    onLoadError: (err) => {
      logError(err, {
        component: "PaymentsAnalytics.loadStats",
      });
    },
  });

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    await execute(async () => {
      // TODO: Replace with actual API call when Firebase Function is ready
      // const response = await fetch(`/api/admin/analytics/payments?range=${timeRange}`);
      // const data = await response.json();
      // return data;

      // Mock data for now
      return {
        totalRevenue: 4567890,
        totalTransactions: 1234,
        averageOrderValue: 3701,
        gatewayBreakdown: [
          {
            gatewayId: "razorpay",
            gatewayName: "Razorpay",
            revenue: 2500000,
            transactions: 750,
            percentage: 54.7,
          },
          {
            gatewayId: "paypal",
            gatewayName: "PayPal",
            revenue: 1200000,
            transactions: 320,
            percentage: 26.3,
          },
          {
            gatewayId: "payu",
            gatewayName: "PayU",
            revenue: 867890,
            transactions: 164,
            percentage: 19.0,
          },
        ],
        currencyBreakdown: [
          {
            currency: "INR",
            revenue: 3367890,
            revenueInINR: 3367890,
            transactions: 914,
            percentage: 73.7,
          },
          {
            currency: "USD",
            revenue: 14400,
            revenueInINR: 1200000,
            transactions: 320,
            percentage: 26.3,
          },
        ],
        internationalVsDomestic: {
          international: {
            revenue: 1200000,
            transactions: 320,
            percentage: 26.3,
          },
          domestic: { revenue: 3367890, transactions: 914, percentage: 73.7 },
        },
        transactionFees: {
          totalFees: 91357,
          feesByGateway: [
            {
              gatewayId: "razorpay",
              gatewayName: "Razorpay",
              fees: 50000,
              percentage: 54.7,
            },
            {
              gatewayId: "paypal",
              gatewayName: "PayPal",
              fees: 30000,
              percentage: 32.8,
            },
            {
              gatewayId: "payu",
              gatewayName: "PayU",
              fees: 11357,
              percentage: 12.4,
            },
          ],
        },
        trends: {
          revenueGrowth: 12.5,
          transactionGrowth: 8.3,
          avgOrderValueGrowth: 3.8,
        },
      };
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUp className="w-4 h-4 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              Payment Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track revenue, transactions, and payment gateway performance
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6 flex gap-2">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {range === "7d" && "Last 7 Days"}
                {range === "30d" && "Last 30 Days"}
                {range === "90d" && "Last 90 Days"}
                {range === "1y" && "Last Year"}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-200">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
          )}

          {stats && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={<Price amount={stats.totalRevenue} />}
                  icon={<DollarSign className="w-6 h-6" />}
                  trend={stats.trends.revenueGrowth}
                  trendLabel={`${stats.trends.revenueGrowth > 0 ? "+" : ""}${
                    stats.trends.revenueGrowth
                  }% from last period`}
                />
                <StatCard
                  title="Total Transactions"
                  value={stats.totalTransactions.toLocaleString()}
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={stats.trends.transactionGrowth}
                  trendLabel={`${
                    stats.trends.transactionGrowth > 0 ? "+" : ""
                  }${stats.trends.transactionGrowth}% from last period`}
                />
                <StatCard
                  title="Average Order Value"
                  value={<Price amount={stats.averageOrderValue} />}
                  icon={<IndianRupee className="w-6 h-6" />}
                  trend={stats.trends.avgOrderValueGrowth}
                  trendLabel={`${
                    stats.trends.avgOrderValueGrowth > 0 ? "+" : ""
                  }${stats.trends.avgOrderValueGrowth}% from last period`}
                />
                <StatCard
                  title="Transaction Fees"
                  value={<Price amount={stats.transactionFees.totalFees} />}
                  icon={<CreditCard className="w-6 h-6" />}
                  trend={0}
                  trendLabel={`${(
                    (stats.transactionFees.totalFees / stats.totalRevenue) *
                    100
                  ).toFixed(2)}% of revenue`}
                />
              </div>

              {/* Gateway Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Payment Gateway Breakdown
                </h2>
                <div className="space-y-4">
                  {stats.gatewayBreakdown.map((gateway) => (
                    <div key={gateway.gatewayId}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {gateway.gatewayName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {gateway.transactions.toLocaleString()}{" "}
                              transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            <Price amount={gateway.revenue} />
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {gateway.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${gateway.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency & International Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Currency Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Currency Breakdown
                  </h2>
                  <div className="space-y-4">
                    {stats.currencyBreakdown.map((currency) => (
                      <div
                        key={currency.currency}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {currency.currency}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {currency.transactions.toLocaleString()}{" "}
                            transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            <Price amount={currency.revenueInINR} />
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {currency.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* International vs Domestic */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    International vs Domestic
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          International
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <Price
                            amount={
                              stats.internationalVsDomestic.international
                                .revenue
                            }
                          />
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${stats.internationalVsDomestic.international.percentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {stats.internationalVsDomestic.international.transactions.toLocaleString()}{" "}
                        transactions (
                        {stats.internationalVsDomestic.international.percentage.toFixed(
                          1
                        )}
                        %)
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Domestic (India)
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <Price
                            amount={
                              stats.internationalVsDomestic.domestic.revenue
                            }
                          />
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${stats.internationalVsDomestic.domestic.percentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {stats.internationalVsDomestic.domestic.transactions.toLocaleString()}{" "}
                        transactions (
                        {stats.internationalVsDomestic.domestic.percentage.toFixed(
                          1
                        )}
                        %)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Fees by Gateway */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Transaction Fees by Gateway
                </h2>
                <div className="space-y-4">
                  {stats.transactionFees.feesByGateway.map((gateway) => (
                    <div
                      key={gateway.gatewayId}
                      className="flex items-center justify-between"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {gateway.gatewayName}
                      </p>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <Price amount={gateway.fees} />
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {gateway.percentage.toFixed(1)}% of total fees
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  trend: number;
  trendLabel: string;
}

function StatCard({ title, value, icon, trend, trendLabel }: StatCardProps) {
  const getTrendIcon = () => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-green-600 dark:text-green-400";
    if (trend < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-600 dark:text-gray-400">{icon}</div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {value}
      </p>
      <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
        {getTrendIcon()}
        <span>{trendLabel}</span>
      </div>
    </div>
  );
}
