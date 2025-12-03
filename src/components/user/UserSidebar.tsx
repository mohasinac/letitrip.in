"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Ticket,
  RotateCcw,
  Star,
  Eye,
  Bell,
  MessageSquare,
  Settings,
  Gavel,
  Clock,
  Users,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    title: "My Orders",
    href: "/user/orders",
    icon: ShoppingBag,
  },
  {
    title: "Favorites",
    href: "/user/favorites",
    icon: Heart,
  },
  {
    title: "Watchlist",
    href: "/user/watchlist",
    icon: Eye,
  },
  {
    title: "My Bids",
    href: "/user/bids",
    icon: Gavel,
  },
  {
    title: "Won Auctions",
    href: "/user/won-auctions",
    icon: Gavel,
  },
  {
    title: "Addresses",
    href: "/user/addresses",
    icon: MapPin,
  },
  {
    title: "Returns",
    href: "/user/returns",
    icon: RotateCcw,
  },
  {
    title: "My Reviews",
    href: "/user/reviews",
    icon: Star,
  },
  {
    title: "Following",
    href: "/user/following",
    icon: Users,
  },
  {
    title: "History",
    href: "/user/history",
    icon: Clock,
  },
  {
    title: "Messages",
    href: "/user/messages",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    href: "/user/notifications",
    icon: Bell,
  },
  {
    title: "Support Tickets",
    href: "/user/tickets",
    icon: Ticket,
  },
  {
    title: "Settings",
    href: "/user/settings",
    icon: Settings,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const isActive = (href: string) => {
    if (href === "/user") {
      return pathname === "/user";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Filter navigation items based on search query
  const filterNavigation = React.useMemo(() => {
    if (!searchQuery.trim()) return navigation;

    const query = searchQuery.toLowerCase().trim();

    return navigation.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.href.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const query = searchQuery.toLowerCase();
    const index = text.toLowerCase().indexOf(query);

    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 font-semibold">
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
          <Link href="/user" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              My Account
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
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
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
                  <span className="flex-1">{highlightText(item.title)}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
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
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
