"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Flag,
  Image,
  Search,
  Shield,
  ChevronDown,
  ChevronRight,
  Home,
  CreditCard,
  Gavel,
  Ticket,
  RotateCcw,
  LifeBuoy,
  Newspaper,
  TrendingUp,
  DollarSign,
  Star,
  Banknote,
  Layout as LayoutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Overview",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Content Management",
    icon: LayoutIcon,
    children: [
      {
        title: "Hero Slides",
        href: "/admin/hero-slides",
        icon: Image,
      },
      {
        title: "Featured Sections",
        href: "/admin/featured-sections",
        icon: Flag,
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
    ],
  },
  {
    title: "Marketplace",
    icon: Store,
    children: [
      {
        title: "All Shops",
        href: "/admin/shops",
        icon: Store,
      },
      {
        title: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        title: "All Auctions",
        href: "/admin/auctions",
        icon: Gavel,
      },
      {
        title: "Live Auctions",
        href: "/admin/auctions/live",
        icon: Gavel,
      },
    ],
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      {
        title: "All Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Star,
      },
    ],
  },
  {
    title: "Transactions",
    icon: CreditCard,
    children: [
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        title: "Seller Payouts",
        href: "/admin/payouts",
        icon: Banknote,
      },
      {
        title: "Coupons",
        href: "/admin/coupons",
        icon: Ticket,
      },
      {
        title: "Returns & Refunds",
        href: "/admin/returns",
        icon: RotateCcw,
      },
    ],
  },
  {
    title: "Support",
    icon: LifeBuoy,
    children: [
      {
        title: "All Tickets",
        href: "/admin/support-tickets",
        icon: LifeBuoy,
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [
      {
        title: "Overview",
        href: "/admin/analytics",
        icon: TrendingUp,
      },
      {
        title: "Sales",
        href: "/admin/analytics/sales",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "Blog",
    icon: Newspaper,
    children: [
      {
        title: "All Posts",
        href: "/admin/blog",
        icon: Newspaper,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "General",
        href: "/admin/settings/general",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
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
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search admin..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href ? isActive(item.href) : false;
            const expanded = expandedItems.includes(item.title);

            return (
              <div key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-yellow-50 text-yellow-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-yellow-600" : "text-gray-400"
                      )}
                    />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleItem(item.title)}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className="flex-1 text-left">{item.title}</span>
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                )}

                {/* Submenu */}
                {item.children && expanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = child.href
                        ? isActive(child.href)
                        : false;

                      return child.href ? (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-yellow-50 text-yellow-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <ChildIcon
                            className={cn(
                              "h-4 w-4",
                              childActive ? "text-yellow-600" : "text-gray-400"
                            )}
                          />
                          <span>{child.title}</span>
                        </Link>
                      ) : null;
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
            href="/"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
