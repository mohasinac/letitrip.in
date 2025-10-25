"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  SELLER_ROUTES,
  ADMIN_ROUTES,
  ACCOUNT_ROUTES,
  getRouteGroup,
  ROUTE_GROUPS,
} from "@/constants/routes";
import {
  CogIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface QuickNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
}

export default function QuickNavigation({ isOpen, onClose }: QuickNavProps) {
  const { user } = useAuth();
  const { currentRoute, routeGroup } = useNavigation();
  const userRole = user?.role;

  const getQuickNavItems = (): QuickNavItem[] => {
    const items: QuickNavItem[] = [];

    if (userRole === "admin") {
      items.push(
        {
          label: "Admin Settings",
          href: ADMIN_ROUTES.SETTINGS_GENERAL,
          icon: CogIcon,
          description: "Platform configuration",
        },
        {
          label: "Product Management",
          href: ADMIN_ROUTES.PRODUCTS_ALL,
          icon: Squares2X2Icon,
          description: "Manage all products",
        },
        {
          label: "Order Management",
          href: ADMIN_ROUTES.ORDERS_PENDING,
          icon: ClipboardDocumentListIcon,
          description: "Track orders",
          badge: "5",
        },
        {
          label: "Analytics",
          href: ADMIN_ROUTES.ANALYTICS_SALES,
          icon: ChartBarIcon,
          description: "Sales insights",
        },
        {
          label: "User Management",
          href: ADMIN_ROUTES.CUSTOMERS_ACTIVE,
          icon: UsersIcon,
          description: "Manage customers",
        }
      );
    }

    if (userRole === "seller" || userRole === "admin") {
      items.push(
        {
          label: "Seller Settings",
          href: SELLER_ROUTES.SETTINGS_STORE,
          icon: CogIcon,
          description: "Store configuration",
        },
        {
          label: "My Products",
          href: SELLER_ROUTES.PRODUCTS_ALL,
          icon: ShoppingBagIcon,
          description: "Manage products",
        },
        {
          label: "Pending Orders",
          href: SELLER_ROUTES.ORDERS_PENDING,
          icon: ClipboardDocumentListIcon,
          description: "Orders to process",
          badge: "2",
        },
        {
          label: "Sales Analytics",
          href: SELLER_ROUTES.ANALYTICS,
          icon: ChartBarIcon,
          description: "Sales performance",
        }
      );
    }

    // Common account items for all authenticated users
    if (userRole) {
      items.push({
        label: "Account Settings",
        href: ACCOUNT_ROUTES.SETTINGS_GENERAL,
        icon: CogIcon,
        description: "Personal preferences",
      });
    }

    return items;
  };

  const quickNavItems = getQuickNavItems();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Quick Navigation Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Navigation
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Current Location */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Current Location
            </h3>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  routeGroup === ROUTE_GROUPS.ADMIN
                    ? "bg-red-500"
                    : routeGroup === ROUTE_GROUPS.SELLER
                    ? "bg-purple-500"
                    : routeGroup === ROUTE_GROUPS.ACCOUNT
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-gray-700">
                {currentRoute.split("/").pop()?.replace("-", " ") || "Home"}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {item.label}
                        </p>
                        {item.badge && (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Pages */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Recently Visited
            </h3>
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
