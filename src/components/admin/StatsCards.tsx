"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  aovChange: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    aovChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Mock data for development
          setStats({
            totalRevenue: 125430,
            totalOrders: 1245,
            totalCustomers: 892,
            averageOrderValue: 100.74,
            revenueChange: 12.5,
            ordersChange: 8.2,
            customersChange: 15.3,
            aovChange: -2.1,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Mock data fallback
        setStats({
          totalRevenue: 125430,
          totalOrders: 1245,
          totalCustomers: 892,
          averageOrderValue: 100.74,
          revenueChange: 12.5,
          ordersChange: 8.2,
          customersChange: 15.3,
          aovChange: -2.1,
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
      color: "bg-blue-500",
    },
    {
      name: "Total Orders",
      value: formatNumber(stats.totalOrders),
      change: stats.ordersChange,
      icon: ShoppingBagIcon,
      color: "bg-green-500",
    },
    {
      name: "Total Customers",
      value: formatNumber(stats.totalCustomers),
      change: stats.customersChange,
      icon: UsersIcon,
      color: "bg-purple-500",
    },
    {
      name: "Average Order Value",
      value: formatCurrency(stats.averageOrderValue),
      change: stats.aovChange,
      icon: ChartBarIcon,
      color: "bg-orange-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="admin-card p-6 animate-pulse">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;

        return (
          <div
            key={card.name}
            className="admin-card p-6 hover:shadow-md transition-shadow"
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
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    {card.name}
                  </dt>
                  <dd className="text-2xl font-bold text-foreground">
                    {card.value}
                  </dd>
                  <dd className="flex items-center text-sm">
                    {isPositive ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(card.change)}%
                    </span>
                    <span className="text-muted-foreground ml-1">
                      vs last month
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
