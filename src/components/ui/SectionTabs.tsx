"use client";

import { usePathname } from "@/i18n/navigation";
import { THEME_CONSTANTS } from "@/constants";
import { Nav } from "../semantic/Semantic";
import { TextLink } from "../typography/TextLink";
import { Span } from "../typography/Typography";

/**
 * SectionTabs
 *
 * Navigation tab strip used across admin, user, seller, and public pages.
 *
 * Design (per wireframe):
 * - Single scrollable row — no separate mobile/desktop variants.
 * - Tabs are evenly spaced: they grow to fill available width equally; when
 *   there are too many to fit they overflow and the strip becomes scrollable.
 * - Active tab: filled brand-colour background + thick bottom underline.
 * - Scrollbar always visible so users know more tabs are reachable.
 * - Clicking navigates to the tab's physical URL path (SSR-safe, no state).
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
    return pathname?.startsWith(href) ?? false;
  };

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

  const { themed, utilities, flex } = THEME_CONSTANTS;

  return (
    <div
      className={`sticky top-12 md:top-[108px] z-10 ${themed.bgSecondary} border-b ${themed.border} shadow-sm ${getVariantGradient()} ${className}`}
    >
      <div className="container mx-auto max-w-7xl">
        <Nav aria-label="Section navigation">
          {/*
           * Outer div:   overflow-x-auto + scrollbarThinX → scrolls when tabs overflow
           * Inner div:   flex min-w-max → forces natural widths on smaller screens;
           *              lg:min-w-0 lg:w-full → allows flex-1 to fill on larger screens
           * Each tab:    flex-1 min-w-fit → grows equally when space allows;
           *              flex-shrink-0 → never shrinks below its text width
           */}
          <div
            className={[
              "overflow-x-auto",
              utilities.scrollbarThinX,
              "pb-0.5",
            ].join(" ")}
          >
            <div className="flex min-w-max px-2 md:px-4 lg:min-w-0 lg:w-full">
              {tabs.map((tab) => {
                const isActive = isActiveTab(tab.href);
                return (
                  <TextLink
                    key={tab.href}
                    href={tab.href}
                    className={[
                      // Equal share of available width, never shrink below text
                      "flex-1 min-w-fit flex-shrink-0",
                      // Content layout
                      `inline-${flex.center} gap-1.5`,
                      "whitespace-nowrap text-sm font-medium",
                      "px-3 sm:px-5 py-3",
                      // Bottom indicator via thick border
                      "relative border-b-[3px]",
                      // Transitions
                      "transition-all duration-200",
                      // Active: filled brand bg + brand underline
                      isActive
                        ? "border-b-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40"
                        : `border-b-transparent ${themed.textSecondary} hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-slate-800/50`,
                    ].join(" ")}
                  >
                    {tab.icon && (
                      <Span
                        variant="inherit"
                        className="w-4 h-4 flex-shrink-0"
                        aria-hidden
                      >
                        {tab.icon}
                      </Span>
                    )}
                    {tab.label}
                  </TextLink>
                );
              })}
            </div>
          </div>
        </Nav>
      </div>
    </div>
  );
}
