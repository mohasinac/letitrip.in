"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Package,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Gamepad2,
  Tag,
  Megaphone,
  Bell,
  FileText,
  TrendingUp,
  Shield,
  Truck,
  Database,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModernTheme } from '@/lib/contexts/ModernThemeContext";

interface AdminSidebarProps {
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

const adminMenuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: "/admin/products",
  },
  {
    label: "Categories",
    icon: FolderTree,
    href: "/admin/categories",
  },
  {
    label: "Orders",
    icon: Package,
    href: "/admin/orders",
  },
  {
    label: "Shipments",
    icon: Truck,
    href: "/admin/shipments",
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Coupons",
    icon: Tag,
    href: "/admin/coupons",
  },
  {
    label: "Sales",
    icon: Megaphone,
    href: "/admin/sales",
  },
  {
    label: "Reviews",
    icon: TrendingUp,
    href: "/admin/reviews",
  },
  {
    label: "Support",
    icon: HeadphonesIcon,
    href: "/admin/support",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    label: "Bulk Operations",
    icon: Database,
    href: "/admin/bulk",
  },
  {
    label: "Game",
    icon: Gamepad2,
    href: "/admin/game/beyblades",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function AdminSidebar({
  open = true,
  onToggle,
}: AdminSidebarProps) {
  const { isDark } = useModernTheme();
  const pathname = usePathname() || "";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
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
          <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {adminMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 no-underline group ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? "" : "min-w-10"
                  } justify-center`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                  />
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
              {(index === 1 || index === 6 || index === 12) && (
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
              <span>Version</span>
              <span className="font-semibold">v1.2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                75%
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </aside>
  );
}
