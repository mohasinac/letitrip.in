"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CogIcon,
  PaintBrushIcon,
  BellIcon,
  UserIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "general",
      name: "General",
      icon: CogIcon,
      href: "/seller/settings/general",
    },
    {
      id: "theme",
      name: "Theme",
      icon: PaintBrushIcon,
      href: "/seller/settings/theme",
    },
    {
      id: "profile",
      name: "Profile",
      icon: UserIcon,
      href: "/seller/settings/profile",
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: BellIcon,
      href: "/seller/settings/notifications",
    },
    {
      id: "store",
      name: "Store",
      icon: ShoppingBagIcon,
      href: "/seller/settings/store",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: ChartBarIcon,
      href: "/seller/settings/analytics",
    },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Seller Settings
              </h1>
              <p className="mt-1 text-sm text-muted">
                Manage your seller account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;

                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="admin-card p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
