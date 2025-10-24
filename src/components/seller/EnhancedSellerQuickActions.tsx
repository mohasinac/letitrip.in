"use client";

import Link from "next/link";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface EnhancedSellerQuickActionsProps {
  stats: any;
  onRefresh: () => void;
}

export default function EnhancedSellerQuickActions({
  stats,
  onRefresh,
}: EnhancedSellerQuickActionsProps) {
  const actions = [
    {
      title: "Add Product",
      description: "Create new product listing",
      href: "/seller/products/new",
      icon: PlusIcon,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Orders",
      description: "Manage your orders",
      href: "/seller/orders",
      icon: PlusIcon,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      href: "/seller/analytics",
      icon: PlusIcon,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {action.description}
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
