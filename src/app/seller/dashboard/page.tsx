"use client";

import {
  ShoppingCart,
  TrendingUp,
  Truck,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import Link from "next/link";
import { SELLER_ROUTES } from "@/constants/routes";

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  href,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  change: string;
  href?: string;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-blue-600 p-3 rounded-lg flex items-center justify-center text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {value}
    </h3>
    <div className="flex justify-between items-center">
      <p className="text-sm text-green-600 dark:text-green-400">{change}</p>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 no-underline"
        >
          View
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  </div>
);

function SellerDashboardContent() {
  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
      active: true,
    },
  ]);

  const stats = [
    {
      icon: ShoppingCart,
      title: "Total Products",
      value: "0",
      change: "Get started by adding products",
      href: SELLER_ROUTES.PRODUCTS,
    },
    {
      icon: Truck,
      title: "Pending Orders",
      value: "0",
      change: "No pending orders",
      href: SELLER_ROUTES.ORDERS,
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: "₹0",
      change: "Start selling to earn",
    },
    {
      icon: TrendingUp,
      title: "This Month",
      value: "₹0",
      change: "No sales yet",
    },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Seller Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your seller panel. Manage your store, products, and
            orders from here.
          </p>
        </div>

        {/* Quick Setup Guide */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-600 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🚀 Quick Setup Guide
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Follow these steps to start selling:
          </p>
          <ol className="pl-5 space-y-2">
            <li className="text-gray-700 dark:text-gray-300">
              <Link
                href={SELLER_ROUTES.SHOP_SETUP}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 no-underline"
              >
                Setup your shop →
              </Link>{" "}
              Configure shop name, pickup addresses, and SEO
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              <Link
                href={SELLER_ROUTES.PRODUCTS_NEW}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 no-underline"
              >
                Add your first product →
              </Link>{" "}
              Upload products with images and details
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              <Link
                href={SELLER_ROUTES.SALES}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 no-underline"
              >
                Create a sale or coupon →
              </Link>{" "}
              Attract customers with discounts
            </li>
          </ol>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Recent Orders
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No orders yet. Your orders will appear here.
              </p>
            </div>
          </div>
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                <Link
                  href={SELLER_ROUTES.PRODUCTS_NEW}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center no-underline font-medium"
                >
                  Add Product
                </Link>
                <Link
                  href={SELLER_ROUTES.COUPONS_NEW}
                  className="w-full px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center no-underline font-medium"
                >
                  Create Coupon
                </Link>
                <Link
                  href={SELLER_ROUTES.SALES_NEW}
                  className="w-full px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center no-underline font-medium"
                >
                  Create Sale
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <RoleGuard requiredRole="seller">
      <SellerDashboardContent />
    </RoleGuard>
  );
}
