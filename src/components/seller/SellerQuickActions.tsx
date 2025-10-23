"use client";

import Link from "next/link";
import {
  PlusIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  DocumentTextIcon,
  TagIcon,
  TruckIcon,
  CameraIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export default function SellerQuickActions() {
  const actions = [
    {
      name: "Add Product",
      description: "List a new product",
      href: "/seller/products/new",
      icon: PlusIcon,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Manage Orders",
      description: "Process orders",
      href: "/seller/orders",
      icon: ShoppingBagIcon,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Analytics",
      description: "View performance",
      href: "/seller/analytics",
      icon: ChartBarIcon,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      name: "Inventory",
      description: "Stock management",
      href: "/seller/inventory",
      icon: TagIcon,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      name: "Shipping",
      description: "Manage shipping",
      href: "/seller/shipping",
      icon: TruckIcon,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      name: "Photos",
      description: "Upload images",
      href: "/seller/media",
      icon: CameraIcon,
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      name: "Promotions",
      description: "Create campaigns",
      href: "/seller/promotions",
      icon: MegaphoneIcon,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      name: "Settings",
      description: "Store settings",
      href: "/seller/settings",
      icon: CogIcon,
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage your store efficiently
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="group relative bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all duration-200 hover:shadow-sm border hover:border-gray-200 text-center"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                      {action.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600">24</div>
              <div className="text-xs text-blue-600">Active Products</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">18</div>
              <div className="text-xs text-green-600">Pending Orders</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  Seller Tip
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Upload high-quality product images to increase your conversion
                  rate by up to 40%!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
