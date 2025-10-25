"use client";

import Link from "next/link";
import {
  PlusIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  DocumentTextIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function QuickActions() {
  const actions = [
    {
      name: "Add Product",
      description: "Create a new product listing",
      href: "/admin/products/new",
      icon: PlusIcon,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "View Orders",
      description: "Manage customer orders",
      href: "/admin/orders",
      icon: ShoppingBagIcon,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Customer Management",
      description: "View and manage customers",
      href: "/admin/customers",
      icon: UsersIcon,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      name: "Analytics",
      description: "View detailed reports",
      href: "/admin/analytics",
      icon: ChartBarIcon,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      name: "Categories",
      description: "Manage product categories",
      href: "/admin/categories",
      icon: TagIcon,
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      name: "Reviews",
      description: "Moderate product reviews",
      href: "/admin/reviews",
      icon: DocumentTextIcon,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      name: "Notifications",
      description: "System notifications",
      href: "/admin/notifications",
      icon: BellIcon,
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      name: "Settings",
      description: "Store configuration",
      href: "/admin/settings",
      icon: CogIcon,
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">
          Common tasks and shortcuts to manage your store
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="group relative bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all duration-200 hover:shadow-sm border hover:border-gray-200"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-6 h-6 text-white" />
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
      </div>
    </div>
  );
}
