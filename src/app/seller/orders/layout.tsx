"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClockIcon,
  CogIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface SellerOrdersLayoutProps {
  children: React.ReactNode;
}

export default function SellerOrdersLayout({
  children,
}: SellerOrdersLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "pending",
      name: "Pending",
      icon: ClockIcon,
      href: "/seller/orders/pending",
      badge: "2",
    },
    {
      id: "processing",
      name: "Processing",
      icon: CogIcon,
      href: "/seller/orders/processing",
    },
    {
      id: "shipped",
      name: "Shipped",
      icon: TruckIcon,
      href: "/seller/orders/shipped",
    },
    {
      id: "completed",
      name: "Completed",
      icon: CheckCircleIcon,
      href: "/seller/orders/completed",
    },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Order Management
              </h1>
              <p className="mt-1 text-sm text-muted">
                Track and manage your customer orders
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
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </div>
                    {tab.badge && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        {tab.badge}
                      </span>
                    )}
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
