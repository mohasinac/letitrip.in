"use client";

import { useState, useEffect } from "react";
import { SellerStats } from "@/lib/services/seller.service";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface EnhancedSellerStatsCardsProps {
  stats: SellerStats | null;
  loading: boolean;
  lastUpdated: Date | null;
}

export default function EnhancedSellerStatsCards({
  stats,
  loading,
  lastUpdated,
}: EnhancedSellerStatsCardsProps) {
  const [animatedValues, setAnimatedValues] = useState<SellerStats | null>(
    null
  );

  // Animate number changes
  useEffect(() => {
    if (!stats) return;

    if (!animatedValues) {
      setAnimatedValues(stats);
      return;
    }

    // Simple animation for number changes
    const animationDuration = 1000;
    const steps = 60;
    const stepDuration = animationDuration / steps;

    Object.keys(stats).forEach((key) => {
      const statKey = key as keyof SellerStats;
      if (
        typeof stats[statKey] === "number" &&
        typeof animatedValues[statKey] === "number"
      ) {
        const startValue = animatedValues[statKey] as number;
        const endValue = stats[statKey] as number;
        const difference = endValue - startValue;

        if (difference !== 0) {
          let currentStep = 0;
          const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const currentValue = startValue + difference * progress;

            setAnimatedValues((prev) =>
              prev
                ? {
                    ...prev,
                    [statKey]: Math.round(currentValue * 100) / 100, // Round to 2 decimal places
                  }
                : null
            );

            if (currentStep >= steps) {
              clearInterval(interval);
              setAnimatedValues((prev) =>
                prev
                  ? {
                      ...prev,
                      [statKey]: endValue,
                    }
                  : null
              );
            }
          }, stepDuration);
        }
      }
    });
  }, [stats]);

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

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const cards = [
    {
      name: "Total Revenue",
      value: animatedValues
        ? formatCurrency(animatedValues.totalRevenue)
        : "₹0",
      change: stats?.revenueChange || 0,
      icon: CurrencyDollarIcon,
      color: "bg-blue-500",
      bgGradient: "from-blue-400 to-blue-600",
      description: "Total sales revenue",
      priority: stats && stats.revenueChange < -20 ? "high" : "normal",
    },
    {
      name: "Total Orders",
      value: animatedValues ? formatNumber(animatedValues.totalOrders) : "0",
      change: stats?.ordersChange || 0,
      icon: ShoppingBagIcon,
      color: "bg-green-500",
      bgGradient: "from-green-400 to-green-600",
      description: "Orders received",
      priority: stats && stats.pendingOrders > 20 ? "high" : "normal",
      badge:
        stats && stats.pendingOrders > 0
          ? `${stats.pendingOrders} pending`
          : undefined,
    },
    {
      name: "Active Products",
      value: animatedValues ? formatNumber(animatedValues.activeProducts) : "0",
      change: 0,
      icon: ChartBarIcon,
      color: "bg-purple-500",
      bgGradient: "from-purple-400 to-purple-600",
      description: "Products listed",
      priority: stats && stats.activeProducts < 5 ? "high" : "normal",
      badge: stats ? `${stats.totalProducts} total` : undefined,
    },
    {
      name: "Average Rating",
      value: animatedValues
        ? `${animatedValues.averageRating.toFixed(1)}★`
        : "0★",
      change: 0,
      icon: StarIcon,
      color: "bg-yellow-500",
      bgGradient: "from-yellow-400 to-yellow-600",
      description: "Customer rating",
      priority: stats && stats.averageRating < 3.5 ? "high" : "normal",
      badge: stats ? `${stats.totalReviews} reviews` : undefined,
    },
  ];

  if (loading && !animatedValues) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          {loading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Updating...
            </div>
          )}
        </div>
      )}

      {/* Goal Progress Bar */}
      {stats && stats.monthlyGoal > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Monthly Goal Progress
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatCurrency(stats.totalRevenue)} /{" "}
              {formatCurrency(stats.monthlyGoal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                stats.goalProgress >= 100
                  ? "bg-green-500"
                  : stats.goalProgress >= 75
                  ? "bg-blue-500"
                  : stats.goalProgress >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(stats.goalProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{stats.goalProgress.toFixed(1)}% achieved</span>
            {stats.goalProgress >= 100 && (
              <span className="text-green-600 font-medium">
                Goal achieved! 🎉
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const ChangeIcon = getChangeIcon(card.change);
          const isPositive = card.change >= 0;

          return (
            <div
              key={card.name}
              className={`relative bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
                card.priority === "high" ? "ring-2 ring-red-200" : ""
              }`}
            >
              {/* Priority Indicator */}
              {card.priority === "high" && (
                <div className="absolute top-2 right-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                </div>
              )}

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-lg flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate flex items-center justify-between">
                      {card.name}
                      {card.badge && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {card.badge}
                        </span>
                      )}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 mb-1">
                      {card.value}
                    </dd>
                    {card.change !== 0 && (
                      <dd className="flex items-center text-sm">
                        <ChangeIcon
                          className={`w-4 h-4 mr-1 ${getChangeColor(
                            card.change
                          )}`}
                        />
                        <span
                          className={`font-medium ${getChangeColor(
                            card.change
                          )}`}
                        >
                          {Math.abs(card.change).toFixed(1)}%
                        </span>
                        <span className="text-gray-500 ml-1">
                          vs last month
                        </span>
                      </dd>
                    )}
                    <dd className="text-xs text-gray-400 mt-1">
                      {card.description}
                    </dd>
                  </dl>
                </div>
              </div>

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conversion Rate Card */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Conversion Rate
              </h4>
              <div className="text-2xl font-bold text-gray-900">
                {stats.conversionRate.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Performance</div>
              <div
                className={`text-sm font-medium ${
                  stats.conversionRate >= 5
                    ? "text-green-600"
                    : stats.conversionRate >= 3
                    ? "text-blue-600"
                    : stats.conversionRate >= 1
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {stats.conversionRate >= 5
                  ? "Excellent"
                  : stats.conversionRate >= 3
                  ? "Good"
                  : stats.conversionRate >= 1
                  ? "Average"
                  : "Needs Improvement"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
