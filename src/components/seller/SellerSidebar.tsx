"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  TicketPercent,
  Megaphone,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { SELLER_ROUTES } from "@/constants/routes";

interface SellerSidebarProps {
  open?: boolean;
  onToggle?: (open: boolean) => void;
  unreadAlerts?: number;
}

const sellerMenuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: SELLER_ROUTES.DASHBOARD,
  },
  {
    label: "Shop Setup",
    icon: Store,
    href: SELLER_ROUTES.SHOP_SETUP,
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: SELLER_ROUTES.PRODUCTS,
  },
  {
    label: "Orders",
    icon: Package,
    href: SELLER_ROUTES.ORDERS,
  },
  {
    label: "Coupons",
    icon: TicketPercent,
    href: SELLER_ROUTES.COUPONS,
  },
  {
    label: "Sales",
    icon: Megaphone,
    href: SELLER_ROUTES.SALES,
  },
  {
    label: "Shipments",
    icon: Truck,
    href: SELLER_ROUTES.SHIPMENTS,
  },
  {
    label: "Alerts",
    icon: Bell,
    href: SELLER_ROUTES.ALERTS,
    badge: true,
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: SELLER_ROUTES.ANALYTICS,
  },
  {
    label: "Settings",
    icon: Settings,
    href: SELLER_ROUTES.SETTINGS,
  },
];

export default function SellerSidebar({
  open = true,
  onToggle,
  unreadAlerts = 0,
}: SellerSidebarProps) {
  const { isDark } = useModernTheme();
  const pathname = usePathname() || "";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? "80px" : "250px";

  const isItemActive = (href: string) => {
    if (href === SELLER_ROUTES.DASHBOARD) {
      return pathname === SELLER_ROUTES.DASHBOARD;
    }
    return pathname.startsWith(href);
  };

  if (!open) return null;

  return (
    <aside
      className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col"
      style={{ width: sidebarWidth }}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 min-h-16">
        {!isCollapsed && (
          <h2 className="text-base font-bold text-blue-600 dark:text-blue-400">
            Seller Panel
          </h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        {sellerMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          const showBadge = item.badge && unreadAlerts > 0;

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 transition-all duration-200 no-underline group ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? "" : "min-w-10"
                  } justify-center relative`}
                >
                  {showBadge ? (
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadAlerts > 9 ? "9+" : unreadAlerts}
                      </span>
                    </div>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {!isCollapsed && (
                  <span
                    className={`ml-3 text-sm ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
              {/* Add dividers for visual grouping */}
              {(index === 1 || index === 6) && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-2"></div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div
        className={`p-4 border-t border-gray-200 dark:border-gray-800 ${
          isCollapsed ? "text-center" : ""
        }`}
      >
        {!isCollapsed && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Seller v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
}
