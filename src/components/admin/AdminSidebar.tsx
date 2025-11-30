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
        title: "Homepage Settings",
        href: "/admin/homepage",
        icon: Home,
      },
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  // Filter navigation items based on search query
  const filterNavigation = React.useMemo(() => {
    if (!searchQuery.trim()) return navigation;

    const query = searchQuery.toLowerCase().trim();

    return navigation
      .map((item) => {
        // Check if parent matches
        const parentMatches =
          item.title.toLowerCase().includes(query) ||
          (item.href && item.href.toLowerCase().includes(query));

        // Check if any children match
        const matchingChildren = item.children
          ? item.children.filter(
              (child) =>
                child.title.toLowerCase().includes(query) ||
                (child.href && child.href.toLowerCase().includes(query))
            )
          : [];

        // Include item if parent matches or has matching children
        if (parentMatches || matchingChildren.length > 0) {
          return {
            ...item,
            children:
              matchingChildren.length > 0 ? matchingChildren : item.children,
          };
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
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          active
                            ? "text-yellow-600 dark:text-yellow-500"
                            : "text-gray-400 dark:text-gray-500"
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
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                "h-4 w-4",
                                childActive
                                  ? "text-yellow-600 dark:text-yellow-500"
                                  : "text-gray-400 dark:text-gray-500"
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
