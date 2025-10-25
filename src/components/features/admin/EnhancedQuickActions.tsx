"use client";

import Link from "next/link";
import { AdminStats } from "@/lib/services/admin.service";
import {
  PlusIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface EnhancedQuickActionsProps {
  stats: AdminStats | null;
  onRefresh: () => void;
}

export default function EnhancedQuickActions({
  stats,
  onRefresh,
}: EnhancedQuickActionsProps) {
  // Determine priority actions based on stats
  const getPriorityActions = () => {
    const actions = [];

    if (stats?.lowStockProducts && stats.lowStockProducts > 0) {
      actions.push({
        id: "low-stock",
        title: "Review Low Stock",
        description: `${stats.lowStockProducts} products need attention`,
        href: "/admin/products?filter=low-stock",
        icon: ExclamationTriangleIcon,
        color: "bg-red-500 hover:bg-red-600",
        priority: "high",
        urgent: stats.lowStockProducts > 10,
      });
    }

    if (stats?.pendingOrders && stats.pendingOrders > 0) {
      actions.push({
        id: "pending-orders",
        title: "Process Orders",
        description: `${stats.pendingOrders} orders awaiting processing`,
        href: "/admin/orders?status=pending",
        icon: ShoppingBagIcon,
        color: "bg-orange-500 hover:bg-orange-600",
        priority: "medium",
        urgent: stats.pendingOrders > 20,
      });
    }

    return actions;
  };

  const regularActions = [
    {
      id: "add-product",
      title: "Add Product",
      description: "Create a new product listing",
      href: "/admin/products/add",
      icon: PlusIcon,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "manage-users",
      title: "Manage Users",
      description: "View and manage customer accounts",
      href: "/admin/customers",
      icon: UserGroupIcon,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "view-analytics",
      title: "View Analytics",
      description: "Detailed sales and performance reports",
      href: "/admin/analytics",
      icon: ChartBarIcon,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      id: "view-orders",
      title: "All Orders",
      description: "Manage and track all orders",
      href: "/admin/orders",
      icon: EyeIcon,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure store settings",
      href: "/admin/settings",
      icon: Cog6ToothIcon,
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  const priorityActions = getPriorityActions();
  const allActions = [...priorityActions, ...regularActions];

  return (
    <div className="space-y-6">
      {/* Priority Actions Alert */}
      {priorityActions.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Action Required
            </h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {priorityActions.length} item{priorityActions.length > 1 ? "s" : ""}{" "}
            need immediate attention.
          </p>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh data"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allActions.map((action) => {
              const Icon = action.icon;
              const isPriority = priorityActions.some(
                (p) => p.id === action.id
              );

              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={`relative group block p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    isPriority
                      ? "border-red-200 bg-red-50 hover:border-red-300"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {/* Priority Badge */}
                  {isPriority && (action as any).urgent && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-medium ${
                          isPriority ? "text-red-900" : "text-gray-900"
                        } group-hover:text-gray-700`}
                      >
                        {action.title}
                      </h4>
                      <p
                        className={`text-xs mt-1 ${
                          isPriority ? "text-red-700" : "text-gray-500"
                        } group-hover:text-gray-600`}
                      >
                        {action.description}
                      </p>

                      {isPriority && (action as any).priority && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              (action as any).priority === "high"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {(action as any).priority === "high"
                              ? "High Priority"
                              : "Medium Priority"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Statistics Summary */}
        {stats && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.totalOrders}
                </div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.totalProducts}
                </div>
                <div className="text-xs text-gray-500">Products</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.totalCustomers}
                </div>
                <div className="text-xs text-gray-500">Customers</div>
              </div>
              <div>
                <div
                  className={`text-lg font-semibold ${
                    (stats.lowStockProducts || 0) > 10
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {stats.lowStockProducts || 0}
                </div>
                <div className="text-xs text-gray-500">Low Stock</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
