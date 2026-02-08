"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { THEME_CONSTANTS } from "@/constants";

/**
 * UserTabs Component
 *
 * Navigation tabs for user section pages (Profile, Orders, Wishlist, Addresses, Settings)
 * Automatically highlights the active tab based on current pathname
 *
 * @component
 * @example
 * ```tsx
 * <UserTabs />
 * ```
 */

const USER_TABS = [
  { label: "Profile", href: "/user/profile" },
  { label: "Orders", href: "/user/orders" },
  { label: "Wishlist", href: "/user/wishlist" },
  { label: "Addresses", href: "/user/addresses" },
  { label: "Settings", href: "/user/settings" },
] as const;

export default function UserTabs() {
  const pathname = usePathname();

  const isActiveTab = (href: string) => {
    if (href === "/user/profile") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={`sticky top-20 z-10 ${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor} shadow-sm mb-6`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <nav className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {USER_TABS.map((tab) => {
            const isActive = isActiveTab(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex-shrink-0 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-200
                  border-b-2 whitespace-nowrap
                  ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400 border-primary-500"
                      : `${THEME_CONSTANTS.themed.textSecondary} border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600`
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
