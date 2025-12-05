/**
 * @fileoverview React Component
 * @module src/components/navigation/TabbedLayout
 * @description This file contains the TabbedLayout component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { TabNav } from "./TabNav";
import type { Tab } from "@/constants/tabs";

/**
 * TabbedLayoutProps interface
 * 
 * @interface
 * @description Defines the structure and contract for TabbedLayoutProps
 */
interface TabbedLayoutProps {
  /** Tabs */
  tabs: Tab[];
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Children */
  children: React.ReactNode;
  /** Actions */
  actions?: React.ReactNode;
  /** Variant */
  variant?: "default" | "pills" | "underline";
}

/**
 * Function: Tabbed Layout
 */
/**
 * Performs tabbed layout operation
 *
 * @returns {any} The tabbedlayout result
 *
 * @example
 * TabbedLayout();
 */

/**
 * Performs tabbed layout operation
 *
 * @returns {any} The tabbedlayout result
 *
 * @example
 * TabbedLayout();
 */

export function TabbedLayout({
  tabs,
  title,
  description,
  children,
  actions,
  variant = "underline",
}: TabbedLayoutProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header with title and actions */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Tab Navigation */}
      <TabNav tabs={tabs} variant={variant} className="mb-6" />

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
