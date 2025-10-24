"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface SellerStats {
  totalOrders: number;
  totalRevenue: number;
  totalViews: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
  viewsChange: number;
  conversionRate: number;
}

export default function SellerStatsCards() {
  const [stats, setStats] = useState<SellerStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0,
    pendingOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
    viewsChange: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get current user ID (you'd implement this based on your auth system)
        const sellerId = "current-seller-id"; // Replace with actual seller ID from auth context
        const response = await fetch(
          `/api/seller/dashboard/stats?sellerId=${sellerId}`
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Set empty stats when no API endpoint available
          setStats({
            totalOrders: 0,
            totalRevenue: 0,
            totalViews: 0,
            pendingOrders: 0,
            revenueChange: 0,
            ordersChange: 0,
            viewsChange: 0,
            conversionRate: 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch seller stats:", error);
        // Set empty stats on error
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalViews: 0,
          pendingOrders: 0,
          revenueChange: 0,
          ordersChange: 0,
          viewsChange: 0,
          conversionRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  const cards = [
    {
      name: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChange,
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
      description: "This month",
    },
    {
      name: "Total Orders",
      value: formatNumber(stats.totalOrders),
      change: stats.ordersChange,
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
      description: "This month",
    },
    {
      name: "Product Views",
      value: formatNumber(stats.totalViews),
      change: stats.viewsChange,
      icon: EyeIcon,
      color: "bg-purple-500",
      description: "This month",
    },
    {
      name: "Pending Orders",
      value: formatNumber(stats.pendingOrders),
      change: 0,
      icon: ClockIcon,
      color: "bg-orange-500",
      description: "Awaiting fulfillment",
      isPending: true,
    },
  ];

  if (isLoading) {
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
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;

          return (
            <div
              key={card.name}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </dd>
                    <dd className="flex items-center text-sm">
                      {!card.isPending && (
                        <>
                          {isPositive ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span
                            className={`font-medium mr-1 ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {Math.abs(card.change)}%
                          </span>
                        </>
                      )}
                      <span className="text-gray-500">{card.description}</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.conversionRate}%
            </div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
            <div className="text-xs text-gray-400 mt-1">Views to orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue / stats.totalOrders || 0)}
            </div>
            <div className="text-sm text-gray-500">Avg Order Value</div>
            <div className="text-xs text-gray-400 mt-1">Per transaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((stats.totalOrders / stats.totalViews) * 100 * 10) /
                10}
              %
            </div>
            <div className="text-sm text-gray-500">View to Order</div>
            <div className="text-xs text-gray-400 mt-1">Engagement rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
