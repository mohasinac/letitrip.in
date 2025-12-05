/**
 * @fileoverview React Component
 * @module src/components/navigation/TabNav
 * @description This file contains the TabNav component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Tab } from "@/constants/tabs";

/**
 * TabNavProps interface
 * 
 * @interface
 * @description Defines the structure and contract for TabNavProps
 */
interface TabNavProps {
  /** Tabs */
  tabs: Tab[];
  /** Class Name */
  className?: string;
  /** Variant */
  variant?: "default" | "pills" | "underline";
}

/**
 * Function: Tab Nav
 */
/**
 * Performs tab nav operation
 *
 * @param {TabNavProps} [{
  tabs,
  className,
  variant] - The {
  tabs,
  /**
   * Name class
   * @class name
   */
  class name,
  variant
 *
 * @returns {any} The tabnav result
 *
 * @example
 * TabNav({
  tabs,
  className,
  variant);
 */

/**
 * Performs tab nav operation
 *
 * @param {TabNavProps} [{
  tabs,
  className,
  variant] - The {
  tabs,
  class name,
  variant
 *
 * @returns {any} The tabnav result
 *
 * @example
 * TabNav({
  tabs,
  className,
  variant);
 */

export function TabNav({
  tabs,
  className,
  variant = "underline",
}: TabNavProps) {
  const pathname = usePathname();

  // Check if a tab is active - exact match or starts with href (for nested routes)
  /**
   * Checks if active
   *
   * @param {Tab} tab - The tab
   *
   * @returns {any} The isactive result
   */

  /**
   * Checks if active
   *
   * @param {Tab} tab - The tab
   *
   * @returns {any} The isactive result
   */

  const isActive = (tab: Tab) => {
    // Exact match
    if (pathname === tab.href) return true;
    // Check if it's a parent route (but not for query-based tabs)
    if (!tab.href.includes("?") && pathname.startsWith(tab.href + "/"))
      return true;
    return false;
  };

  if (variant === "pills") {
    return (
      <nav className={cn("flex flex-wrap gap-2", className)}>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
              isActive(tab)
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    );
  }

  if (variant === "default") {
    return (
      <nav
        className={cn(
          "flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg",
          className,
        )}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              isActive(tab)
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    );
  }

  // Underline variant (default)
  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700",
        className,
      )}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            isActive(tab)
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
