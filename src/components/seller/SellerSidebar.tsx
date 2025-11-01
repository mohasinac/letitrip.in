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
  TrendingUp,
  DollarSign,
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
    label: "Shipments",
    icon: Truck,
    href: SELLER_ROUTES.SHIPMENTS,
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
    label: "Analytics",
    icon: BarChart3,
    href: SELLER_ROUTES.ANALYTICS,
  },
  {
    label: "Revenue",
    icon: DollarSign,
    href: SELLER_ROUTES.ANALYTICS + "?tab=revenue",
  },
  {
    label: "Alerts",
    icon: Bell,
    href: SELLER_ROUTES.ALERTS,
    badge: true,
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

  const isItemActive = (href: string) => {
    if (href === SELLER_ROUTES.DASHBOARD) {
      return pathname === SELLER_ROUTES.DASHBOARD;
    }
    return pathname.startsWith(href);
  };

  if (!open) return null;

  return (
    <aside
      className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col sticky top-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ minWidth: isCollapsed ? "5rem" : "16rem" }}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 min-h-16">
        {!isCollapsed && (
          <h2 className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Seller Panel
          </h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {sellerMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          const showBadge = item.badge && unreadAlerts > 0;

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 no-underline group ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400"
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
                      <Icon
                        className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                      />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold animate-bounce">
                        {unreadAlerts > 9 ? "9+" : unreadAlerts}
                      </span>
                    </div>
                  ) : (
                    <Icon
                      className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                    />
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
                {!isCollapsed && showBadge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {unreadAlerts > 99 ? "99+" : unreadAlerts}
                  </span>
                )}
              </Link>
              {/* Add dividers for visual grouping */}
              {(index === 1 || index === 4 || index === 7) && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4"></div>
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
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Store Status</span>
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span>Version v1.2.0</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
            <Store className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </aside>
  );
}
