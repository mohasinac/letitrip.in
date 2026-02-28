"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { THEME_CONSTANTS } from "@/constants";
import { HorizontalScroller } from "./HorizontalScroller";

/**
 * SectionTabs Component
 *
 * Unified navigation tabs component for admin, user, seller, and public sections.
 * - Mobile: Scrollable horizontal tab strip (no arrows, shows scrollbar)
 * - Desktop: Scrollable tab bar with arrow navigation and scrollbar
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

  const { themed } = THEME_CONSTANTS;

  return (
    <div
      className={`sticky top-12 md:top-[108px] z-10 ${themed.bgSecondary} border-b ${themed.border} shadow-sm ${getVariantGradient()} ${className}`}
    >
      <div className="container mx-auto px-2 md:px-6 max-w-7xl">
        {/* Unified scrollable tab bar — mobile: no arrows · desktop: with arrows */}
        <nav>
          <HorizontalScroller
            items={Array.from(tabs)}
            renderItem={(tab) => {
              const isActive = isActiveTab(tab.href);
              return (
                <Link
                  href={tab.href}
                  className={[
                    "flex-shrink-0 px-3 md:px-5 py-3 md:py-3.5 text-sm font-medium transition-all duration-200",
                    "border-b-2 whitespace-nowrap inline-flex items-center gap-1.5",
                    isActive
                      ? "text-primary-600 dark:text-primary-400 border-primary-500"
                      : `${themed.textSecondary} border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600`,
                  ].join(" ")}
                >
                  {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                  {tab.label}
                </Link>
              );
            }}
            keyExtractor={(tab) => tab.href}
            gap={0}
            autoScroll={false}
            showScrollbar
            showArrows={false}
            className="outline-none md:hidden"
          />
          <HorizontalScroller
            items={Array.from(tabs)}
            renderItem={(tab) => {
              const isActive = isActiveTab(tab.href);
              return (
                <Link
                  href={tab.href}
                  className={[
                    "flex-shrink-0 px-5 py-3.5 text-sm md:text-base font-medium transition-all duration-200",
                    "border-b-2 whitespace-nowrap inline-flex items-center gap-2",
                    isActive
                      ? "text-primary-600 dark:text-primary-400 border-primary-500"
                      : `${themed.textSecondary} border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600`,
                  ].join(" ")}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            }}
            keyExtractor={(tab) => tab.href}
            gap={0}
            autoScroll={false}
            showScrollbar
            className="outline-none hidden md:block"
          />
        </nav>
      </div>
    </div>
  );
}
