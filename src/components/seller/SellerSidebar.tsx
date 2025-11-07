"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  RotateCcw,
  Ticket,
  BarChart3,
  DollarSign,
  Megaphone,
  Star,
  Gavel,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/seller",
    icon: LayoutDashboard,
  },
  {
    title: "My Shops",
    href: "/seller/my-shops",
    icon: Store,
  },
  {
    title: "Products",
    href: "/seller/products",
    icon: Package,
    children: [
      {
        title: "All Products",
        href: "/seller/products",
        icon: Package,
      },
      {
        title: "Add Product",
        href: "/seller/products/add",
        icon: Package,
      },
    ],
  },
  {
    title: "Auctions",
    href: "/seller/auctions",
    icon: Gavel,
    children: [
      {
        title: "All Auctions",
        href: "/seller/auctions",
        icon: Gavel,
      },
      {
        title: "Create Auction",
        href: "/seller/auctions/create",
        icon: Gavel,
      },
    ],
  },
  {
    title: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    title: "Returns & Refunds",
    href: "/seller/returns",
    icon: RotateCcw,
  },
  {
    title: "Revenue",
    href: "/seller/revenue",
    icon: DollarSign,
  },
  {
    title: "Marketing",
    href: "/seller/marketing",
    icon: Megaphone,
  },
  {
    title: "Analytics",
    href: "/seller/analytics",
    icon: BarChart3,
  },
  {
    title: "Reviews",
    href: "/seller/reviews",
    icon: Star,
  },
  {
    title: "Support Tickets",
    href: "/seller/support-tickets",
    icon: Ticket,
  },
  {
    title: "Coupons",
    href: "/seller/coupons",
    icon: Ticket,
  },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleItem = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block lg:fixed lg:top-[7rem] lg:bottom-0 lg:left-0 lg:z-30">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/seller" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Seller Hub
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.title);

            return (
              <div key={item.title}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault();
                      toggleItem(item.title);
                    }
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    <div>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </Link>

                {/* Submenu */}
                {item.children && expanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <ChildIcon
                            className={cn(
                              "h-4 w-4",
                              childActive ? "text-blue-600" : "text-gray-400"
                            )}
                          />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/help"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Help & Support</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
