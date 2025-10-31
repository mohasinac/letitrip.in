/**
 * Mobile Bottom Navigation Component
 * Fixed bottom navigation bar for mobile devices
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeviceDetection } from "@/utils/mobile";

export interface MobileNavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  onClick?: () => void;
}

export interface MobileBottomNavProps {
  /** Navigation items */
  items?: MobileNavItem[];
  /** Hide navigation on specific paths */
  hidePaths?: string[];
  /** Custom className */
  className?: string;
}

const defaultItems: MobileNavItem[] = [
  {
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    href: "/",
  },
  {
    label: "Shop",
    icon: <ShoppingBag className="w-5 h-5" />,
    href: "/products",
  },
  {
    label: "Search",
    icon: <Search className="w-5 h-5" />,
    href: "/search",
  },
  {
    label: "Account",
    icon: <User className="w-5 h-5" />,
    href: "/account",
  },
  {
    label: "Menu",
    icon: <Menu className="w-5 h-5" />,
    href: "/menu",
  },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items = defaultItems,
  hidePaths = ["/admin", "/seller", "/game"],
  className,
}) => {
  const pathname = usePathname();
  const { isMobile } = useDeviceDetection();

  // Hide on desktop or specific paths
  if (!isMobile || hidePaths.some((path) => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <nav
      className={cn(
        // Fixed positioning
        "fixed bottom-0 left-0 right-0 z-[1020]",

        // Layout
        "flex items-center justify-around",

        // Spacing with safe area
        "px-2 pt-2",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",

        // Styling
        "bg-white dark:bg-gray-950",
        "border-t border-gray-200 dark:border-gray-800",
        "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",

        // Accessibility
        "md:hidden", // Hide on tablet and desktop

        className
      )}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {items.map((item, index) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={index}
            href={item.href}
            onClick={item.onClick}
            className={cn(
              // Layout
              "flex flex-col items-center justify-center",
              "min-w-[44px] min-h-[44px]",
              "px-2 py-1.5",
              "relative",

              // Typography
              "text-xs font-medium",

              // Colors
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",

              // Interaction
              "transition-colors duration-200",
              "no-tap-highlight",
              "select-none",

              // Active feedback
              "active:scale-95"
            )}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Icon */}
            <div className="mb-1">{item.icon}</div>

            {/* Label */}
            <span className="text-[10px] leading-tight">{item.label}</span>

            {/* Badge */}
            {item.badge && item.badge > 0 && (
              <span
                className={cn(
                  "absolute top-0 right-0",
                  "flex items-center justify-center",
                  "min-w-[18px] h-[18px]",
                  "px-1",
                  "text-[10px] font-bold text-white",
                  "bg-error rounded-full",
                  "border-2 border-white dark:border-gray-950"
                )}
                aria-label={`${item.badge} notifications`}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

/**
 * Hook to get mobile bottom nav height for layout spacing
 */
export function useMobileBottomNavHeight(): number {
  const { isMobile } = useDeviceDetection();

  // Approximate height: 56px base + safe area inset bottom
  return isMobile ? 56 : 0;
}

/**
 * Spacer component to add padding for bottom nav
 */
export const MobileBottomNavSpacer: React.FC = () => {
  const height = useMobileBottomNavHeight();

  if (height === 0) return null;

  return <div style={{ height: `${height}px` }} aria-hidden="true" />;
};

export default MobileBottomNav;
