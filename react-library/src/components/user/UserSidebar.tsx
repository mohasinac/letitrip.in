import { LayoutDashboard, Search } from "lucide-react";
import React, { ComponentType, ReactNode, useRef, useState } from "react";

export interface UserNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface UserSidebarProps {
  navigation: UserNavItem[];
  currentPath: string;
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  className?: string;
  headerTitle?: string;
  headerIcon?: React.ComponentType<{ className?: string }>;
  homeHref?: string;
  homeLabel?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  noResultsSubText?: string;
}

export function UserSidebar({
  navigation,
  currentPath,
  LinkComponent,
  className = "",
  headerTitle = "My Account",
  headerIcon: HeaderIcon = LayoutDashboard,
  homeHref = "/",
  homeLabel = "Back to Home",
  searchPlaceholder = "Search...",
  noResultsText = "No results found",
  noResultsSubText = "Try a different search term",
}: UserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter navigation based on search query
  const filterNavigation = navigation.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Utility function to check if a path is active
  const isActive = (href: string) => {
    if (href === "/user") {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  // Utility function to highlight search text
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-yellow-200 dark:bg-yellow-800/50">
          {text.slice(index, index + searchQuery.length)}
        </mark>
        {text.slice(index + searchQuery.length)}
      </>
    );
  };

  const cn = (...classes: (string | undefined)[]) =>
    classes.filter(Boolean).join(" ");

  return (
    <aside
      className={`hidden w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:block lg:fixed lg:top-[7rem] lg:bottom-0 lg:left-0 lg:z-20 ${className}`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-6">
          <LinkComponent href="/user" className="flex items-center gap-2">
            <HeaderIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {headerTitle}
            </span>
          </LinkComponent>
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
              placeholder={searchPlaceholder}
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
              <p>{noResultsText}</p>
              <p className="mt-1 text-xs">{noResultsSubText}</p>
            </div>
          ) : (
            filterNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <LinkComponent
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
                </LinkComponent>
              );
            })
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <LinkComponent
            href={homeHref}
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
            <span>{homeLabel}</span>
          </LinkComponent>
        </div>
      </div>
    </aside>
  );
}

// Export default navigation configuration
export const defaultUserNavigation: UserNavItem[] = [
  {
    title: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    title: "My Orders",
    href: "/user/orders",
    icon: require("lucide-react").ShoppingBag,
  },
  {
    title: "Favorites",
    href: "/user/favorites",
    icon: require("lucide-react").Heart,
  },
  {
    title: "Watchlist",
    href: "/user/watchlist",
    icon: require("lucide-react").Eye,
  },
  {
    title: "My Bids",
    href: "/user/bids",
    icon: require("lucide-react").Gavel,
  },
  {
    title: "Won Auctions",
    href: "/user/won-auctions",
    icon: require("lucide-react").Gavel,
  },
  {
    title: "Addresses",
    href: "/user/addresses",
    icon: require("lucide-react").MapPin,
  },
  {
    title: "Returns",
    href: "/user/returns",
    icon: require("lucide-react").RotateCcw,
  },
  {
    title: "My Reviews",
    href: "/user/reviews",
    icon: require("lucide-react").Star,
  },
  {
    title: "Following",
    href: "/user/following",
    icon: require("lucide-react").Users,
  },
  {
    title: "History",
    href: "/user/history",
    icon: require("lucide-react").Clock,
  },
  {
    title: "Messages",
    href: "/user/messages",
    icon: require("lucide-react").MessageSquare,
  },
  {
    title: "Notifications",
    href: "/user/notifications",
    icon: require("lucide-react").Bell,
  },
  {
    title: "Support Tickets",
    href: "/user/tickets",
    icon: require("lucide-react").Ticket,
  },
  {
    title: "Settings",
    href: "/user/settings",
    icon: require("lucide-react").Settings,
  },
];
