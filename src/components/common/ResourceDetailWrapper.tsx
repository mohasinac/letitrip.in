/**
 * @fileoverview React Component
 * @module src/components/common/ResourceDetailWrapper
 * @description This file contains the ResourceDetailWrapper component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * BreadcrumbItem interface
 * 
 * @interface
 * @description Defines the structure and contract for BreadcrumbItem
 */
interface BreadcrumbItem {
  /** Label */
  label: string;
  /** Href */
  href?: string;
}

/**
 * Tab interface
 * 
 * @interface
 * @description Defines the structure and contract for Tab
 */
interface Tab {
  /** Id */
  id: string;
  /** Label */
  label: string;
  /** Content */
  content: ReactNode;
}

/**
 * StatsCard interface
 * 
 * @interface
 * @description Defines the structure and contract for StatsCard
 */
interface StatsCard {
  /** Label */
  label: string;
  /** Value */
  value: string | number;
  /** Icon */
  icon?: ReactNode;
  /** Color */
  color?: string;
}

/**
 * ResourceDetailWrapperProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ResourceDetailWrapperProps
 */
interface ResourceDetailWrapperProps {
  // Context
  /** Context */
  context: "admin" | "seller" | "public";

  // Breadcrumbs
  /** Breadcrumbs */
  breadcrumbs: BreadcrumbItem[];

  // Header
  /** Title */
  title: string;
  /** Subtitle */
  subtitle?: string;
  /** Badge */
  badge?: ReactNode;

  // Action Buttons (contextual)
  /** Actions */
  actions?: ReactNode;

  // Tabs (optional)
  /** Tabs */
  tabs?: Tab[];
  /** Active Tab */
  activeTab?: string;
  /** On Tab Change */
  onTabChange?: (tabId: string) => void;

  // Stats Cards (optional)
  /** Stats */
  stats?: StatsCard[];

  // Main Content
  /** Children */
  children: ReactNode;

  // Related Items (optional)
  /** Related Items */
  relatedItems?: ReactNode;

  // Comments/Reviews Section (optional)
  /** Comments Section */
  commentsSection?: ReactNode;
}

export default /**
 * Performs resource detail wrapper operation
 *
 * @param {ResourceDetailWrapperProps} {
  context,
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  tabs,
  activeTab,
  onTabChange,
  stats,
  children,
  relatedItems,
  commentsSection,
} - The {
  context,
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  tabs,
  activetab,
  ontabchange,
  stats,
  children,
  relateditems,
  commentssection,
}
 *
 * @returns {any} The resourcedetailwrapper result
 *
 */
function ResourceDetailWrapper({
  context,
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  tabs,
  activeTab,
  onTabChange,
  stats,
  children,
  relatedItems,
  commentsSection,
}: ResourceDetailWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {item.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title and Badge */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {actions && (
              <div className="flex items-center gap-2 flex-wrap">{actions}</div>
            )}
          </div>

          {/* Stats Cards */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${
                    stat.color ||
                    "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                  } p-4 rounded-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    {stat.icon && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {stat.icon}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tab Content or Main Content */}
        {tabs && tabs.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {tabs.find((tab) => tab.id === activeTab)?.content || children}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {children}
          </div>
        )}

        {/* Related Items */}
        {relatedItems && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Related Items
            </h2>
            {relatedItems}
          </div>
        )}

        {/* Comments/Reviews Section */}
        {commentsSection && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {commentsSection}
          </div>
        )}
      </div>
    </div>
  );
}
