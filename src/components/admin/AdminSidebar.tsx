/**
 * @fileoverview React Component
 * @module src/components/admin/AdminSidebar
 * @description This file contains the AdminSidebar component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * NavItem interface
 * 
 * @interface
 * @description Defines the structure and contract for NavItem
 */
interface NavItem {
  /** Title */
  title: string;
  /** Href */
  href?: string;
  /** Icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Badge */
  badge?: string;
  /** Children */
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    /** Title */
    title: "Dashboard",
    /** Href */
    href: "/admin/dashboard",
    /** Icon */
    icon: LayoutDashboard,
  },
  {
    /** Title */
    title: "Overview",
    /** Href */
    href: "/admin",
    /** Icon */
    icon: Home,
  },
  {
    /** Title */
    title: "Content Management",
    /** Icon */
    icon: LayoutIcon,
    /** Children */
    children: [
      {
        /** Title */
        title: "Homepage Settings",
        /** Href */
        href: "/admin/homepage",
        /** Icon */
        icon: Home,
      },
      {
        /** Title */
        title: "Hero Slides",
        /** Href */
        href: "/admin/hero-slides",
        /** Icon */
        icon: Image,
      },
      {
        /** Title */
        title: "Featured Sections",
        /** Href */
        href: "/admin/featured-sections",
        /** Icon */
        icon: Flag,
      },
      {
        /** Title */
        title: "Categories",
        /** Href */
        href: "/admin/categories",
        /** Icon */
        icon: FolderTree,
      },
    ],
  },
  {
    /** Title */
    title: "Marketplace",
    /** Icon */
    icon: Store,
    /** Children */
    children: [
      {
        /** Title */
        title: "All Shops",
        /** Href */
        href: "/admin/shops",
        /** Icon */
        icon: Store,
      },
      {
        /** Title */
        title: "Products",
        /** Href */
        href: "/admin/products",
        /** Icon */
        icon: Package,
      },
      {
        /** Title */
        title: "All Auctions",
        /** Href */
        href: "/admin/auctions",
        /** Icon */
        icon: Gavel,
      },
      {
        /** Title */
        title: "Live Auctions",
        /** Href */
        href: "/admin/auctions/live",
        /** Icon */
        icon: Gavel,
      },
    ],
  },
  {
    /** Title */
    title: "User Management",
    /** Icon */
    icon: Users,
    /** Children */
    children: [
      {
        /** Title */
        title: "All Users",
        /** Href */
        href: "/admin/users",
        /** Icon */
        icon: Users,
      },
      {
        /** Title */
        title: "Reviews",
        /** Href */
        href: "/admin/reviews",
        /** Icon */
        icon: Star,
      },
    ],
  },
  {
    /** Title */
    title: "Transactions",
    /** Icon */
    icon: CreditCard,
    /** Children */
    children: [
      {
        /** Title */
        title: "Orders",
        /** Href */
        href: "/admin/orders",
        /** Icon */
        icon: ShoppingCart,
      },
      {
        /** Title */
        title: "Payments",
        /** Href */
        href: "/admin/payments",
        /** Icon */
        icon: CreditCard,
      },
      {
        /** Title */
        title: "Seller Payouts",
        /** Href */
        href: "/admin/payouts",
        /** Icon */
        icon: Banknote,
      },
      {
        /** Title */
        title: "Coupons",
        /** Href */
        href: "/admin/coupons",
        /** Icon */
        icon: Ticket,
      },
      {
        /** Title */
        title: "Returns & Refunds",
        /** Href */
        href: "/admin/returns",
        /** Icon */
        icon: RotateCcw,
      },
    ],
  },
  {
    /** Title */
    title: "Support",
    /** Icon */
    icon: LifeBuoy,
    /** Children */
    children: [
      {
        /** Title */
        title: "All Tickets",
        /** Href */
        href: "/admin/support-tickets",
        /** Icon */
        icon: LifeBuoy,
      },
    ],
  },
  {
    /** Title */
    title: "Analytics",
    /** Icon */
    icon: BarChart3,
    /** Children */
    children: [
      {
        /** Title */
        title: "Overview",
        /** Href */
        href: "/admin/analytics",
        /** Icon */
        icon: TrendingUp,
      },
      {
        /** Title */
        title: "Sales",
        /** Href */
        href: "/admin/analytics/sales",
        /** Icon */
        icon: DollarSign,
      },
    ],
  },
  {
    /** Title */
    title: "Blog",
    /** Icon */
    icon: Newspaper,
    /** Children */
    children: [
      {
        /** Title */
        title: "All Posts",
        /** Href */
        href: "/admin/blog",
        /** Icon */
        icon: Newspaper,
      },
    ],
  },
  {
    /** Title */
    title: "Settings",
    /** Icon */
    icon: Settings,
    /** Children */
    children: [
      {
        /** Title */
        title: "General",
        /** Href */
        href: "/admin/settings/general",
        /** Icon */
        icon: Settings,
      },
    ],
  },
];

/**
 * Function: Admin Sidebar
 */
/**
 * Performs admin sidebar operation
 *
 * @returns {any} The adminsidebar result
 *
 * @example
 * AdminSidebar();
 */

/**
 * Performs admin sidebar operation
 *
 * @returns {any} The adminsidebar result
 *
 * @example
 * AdminSidebar();
 */

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Performs toggle item operation
   *
   * @param {string} title - The title
   *
   * @returns {string} The toggleitem result
   */

  /**
   * Performs toggle item operation
   *
   * @param {string} title - The title
   *
   * @returns {string} The toggleitem result
   */

  const toggleItem = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  /**
   * Checks if active
   *
   * @param {string} href - The href
   *
   * @returns {string} The isactive result
   */

  /**
   * Checks if active
   *
   * @param {string} href - The href
   *
   * @returns {string} The isactive result
   */

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Filter navigation items based on search query
  /**
 * Performs filter navigation operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The filternavigation result
 *
 */
const filterNavigation = React.useMemo(() => {
    if (!searchQuery.trim()) return navigation;

    const query = searchQuery.toLowerCase().trim();

    return navigation
      .map((item) => {
        // Check if parent matches
        const parentMatches =
          item.title.toLowerCase().includes/**
 * Performs matching children operation
 *
 * @param {any} (child - The (child
 *
 * @returns {any} The matchingchildren result
 *
 */
(query) ||
          (item.href && item.href.toLowerCase().includes(query));

        // Check if any children match
        const matchingChildren = item.children
          ? item.children.filter(
              (child) =>
                child.title.toLowerCase().includes(query) ||
                (child.href && child.href.toLowerCase().includes(query)),
            )
          : [];

        // Include item if parent matches or has matching children
        if (parentMatches || matchingChildren.length > 0) {
          return {
            ...item,
            /** Children */
            children:
              matchingChildren.length > 0 ? matchingChildren : item.children,
          }/**
 * Performs items to expand operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The itemstoexpand result
 *
 */
;
        }

        return null;
      })
      .filter((item) => item !== null) as NavItem[];
  }, [searchQuery]);

  // Auto-expand sections with search results
  React.useEffect(() => {
    if (searchQuery.trim() && filterNavigation.length > 0) {
      const itemsToExpand = filterNavigation
        .filter((item) => item.children && item.children.length > 0)
        .map((item) => item.title);
      setExpandedItems(itemsToExpand);
    }
  }, [searchQuery, filterNavigation]);

  // Highlight matching text
  /**
   * Performs highlight text operation
   *
   * @param {string} text - The text
   *
   * @returns {string} The highlighttext result
   */

  /**
   * Performs highlight text operation
   *
   * @param {string} text - The text
   *
   * @returns {string} The highlighttext result
   */

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const query = searchQuery.toLowerCase();
    const index = text.toLowerCase().indexOf(query);

    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-200 dark:bg-yellow-500/40 text-yellow-900 dark:text-yellow-200 font-semibold px-0.5 rounded">
          {text.slice(index, index + searchQuery.length)}
        </span>
        {text.slice(index + searchQuery.length)}
      </>
    );
  };

  return (
    <aside className="hidden w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:block lg:fixed lg:top-[7rem] lg:bottom-0 lg:left-0 lg:z-20">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filterNavigation.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>No results found</p>
              <p className="mt-1 text-xs">Try a different search term</p>
            </div>
          ) : (
            filterNavigation.map((item) => {
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
                          ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          active
                            ? "text-yellow-600 dark:text-yellow-500"
                            : "text-gray-400 dark:text-gray-500",
                        )}
                      />
                      <span className="flex-1">
                        {highlightText(item.title)}
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleItem(item.title)}
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <span className="flex-1 text-left">
                        {highlightText(item.title)}
                      </span>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                                ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white",
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                "h-4 w-4",
                                childActive
                                  ? "text-yellow-600 dark:text-yellow-500"
                                  : "text-gray-400 dark:text-gray-500",
                              )}
                            />
                            <span>{highlightText(child.title)}</span>
                          </Link>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
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
