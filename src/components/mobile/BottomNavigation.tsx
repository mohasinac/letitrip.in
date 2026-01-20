/**
 * BottomNavigation Component - Phase 7.1
 *
 * Enhanced mobile bottom navigation with icon + label.
 * Provides quick access to main app sections with badge support.
 *
 * Features:
 * - Fixed bottom positioning on mobile
 * - Icon + label for each nav item
 * - Active state indication
 * - Badge support for cart count
 * - Hidden on desktop (≥1024px)
 * - Dark mode support
 * - iOS safe area inset support
 *
 * Usage:
 * - Place in root layout for global navigation
 * - Shows on all pages (mobile only)
 * - Auto-highlights current page
 */

"use client";

import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  showBadgeDot?: boolean;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items?.length || 0;

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Search",
      href: "/search",
      icon: Search,
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartCount,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-white dark:bg-gray-900",
        "border-t border-gray-200 dark:border-gray-800",
        "pb-safe", // iOS safe area inset
        "lg:hidden", // Hidden on desktop
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around h-16 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-w-0 relative",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
                "active:scale-95", // Touch feedback
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Icon with Badge */}
              <div className="relative mb-1">
                <Icon
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110",
                  )}
                  aria-hidden="true"
                />

                {/* Badge Count */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs font-bold text-white bg-red-600 rounded-full animate-in fade-in zoom-in duration-200"
                    aria-label={`${item.badge} items`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}

                {/* Badge Dot (for notifications) */}
                {item.showBadgeDot && (
                  <span
                    className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"
                    aria-label="New notification"
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium truncate max-w-full px-1",
                  isActive && "font-semibold",
                )}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
