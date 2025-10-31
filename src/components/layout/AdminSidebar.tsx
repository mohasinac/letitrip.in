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
  Dices,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModernTheme } from "@/contexts/ModernThemeContext";

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
    label: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    label: "Support",
    icon: HeadphonesIcon,
    href: "/admin/support",
  },
  {
    label: "Game",
    icon: Gamepad2,
    href: "/admin/game/beyblades",
    subItems: [
      {
        label: "Beyblades",
        href: "/admin/game/beyblades",
      },
      {
        label: "Stadiums",
        href: "/admin/game/stadiums",
      },
      {
        label: "Stats",
        href: "/admin/game/stats",
      },
    ],
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

  const sidebarWidth = isCollapsed ? "80px" : "250px";

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
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
            Admin
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
        {adminMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 transition-all duration-200 no-underline ${
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
                  } justify-center`}
                >
                  <Icon className="h-5 w-5" />
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
              {(index === 2 || index === 6) && (
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
          <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
        )}
      </div>
    </aside>
  );
}
