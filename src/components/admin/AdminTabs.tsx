"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * AdminTabs Component
 *
 * Navigation tabs for admin section pages (Dashboard only)
 * Automatically highlights the active tab based on current pathname
 *
 * @component
 * @example
 * ```tsx
 * <AdminTabs />
 * ```
 */

const ADMIN_TABS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Site Settings", href: "/admin/site" },
  { label: "Carousel", href: "/admin/carousel" },
  { label: "Sections", href: "/admin/sections" },
  { label: "Categories", href: "/admin/categories" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Content", href: "/admin/content" },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();

  const isActiveTab = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <div className="sticky top-20 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <nav className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {ADMIN_TABS.map((tab) => {
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
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
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
