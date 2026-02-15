"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { THEME_CONSTANTS } from "@/constants";

/**
 * SectionTabs Component
 *
 * Unified navigation tabs component for admin and user sections.
 * - Desktop: Renders full horizontal tab bar with all tabs visible
 * - Mobile: Renders styled dropdown select with current tab shown
 *
 * Uses ROUTES constants for hrefs and UI_LABELS for labels (Phase 1).
 * Uses THEME_CONSTANTS for styling (Phase 2).
 *
 * @example
 * ```tsx
 * import { SectionTabs } from '@/components';
 * import { ADMIN_TAB_ITEMS } from '@/constants';
 *
 * <SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />
 * ```
 */

export interface SectionTab {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SectionTabsProps {
  tabs: readonly SectionTab[];
  variant?: "admin" | "user" | "default";
  className?: string;
}

export function SectionTabs({
  tabs,
  variant = "default",
  className = "",
}: SectionTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActiveTab = (href: string) => {
    // Exact match for dashboard/root pages
    if (href.endsWith("/dashboard") || href.endsWith("/profile")) {
      return pathname === href;
    }
    // Prefix match for sub-pages
    return pathname?.startsWith(href) || false;
  };

  // Get gradient style based on variant
  const getVariantGradient = () => {
    switch (variant) {
      case "admin":
        return "bg-gradient-to-r from-purple-50/60 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/10";
      case "user":
        return "bg-gradient-to-r from-indigo-50/60 via-transparent to-teal-50/30 dark:from-indigo-950/20 dark:via-transparent dark:to-teal-950/10";
      default:
        return "";
    }
  };

  // Get active tab for mobile dropdown
  const activeTab = tabs.find((tab) => isActiveTab(tab.href));
  const activeValue = activeTab?.href || "";

  const handleMobileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(e.target.value);
  };

  const { themed, input } = THEME_CONSTANTS;

  return (
    <div
      className={`sticky top-[104px] md:top-[112px] z-10 ${themed.bgSecondary} border-b ${themed.border} shadow-sm ${getVariantGradient()} ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Desktop: Full horizontal tab bar */}
        <nav className="hidden md:flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex-shrink-0 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-200
                  border-b-2 whitespace-nowrap
                  inline-flex items-center gap-2
                  ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400 border-primary-500"
                      : `${themed.textSecondary} border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600`
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile: Native select dropdown */}
        <div className="md:hidden py-3">
          <select
            value={activeValue}
            onChange={handleMobileChange}
            className={`w-full ${input.base}`}
          >
            {tabs.map((tab) => (
              <option key={tab.href} value={tab.href}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
