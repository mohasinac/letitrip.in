/**
 * ResourceListWrapper Component
 *
 * Framework-agnostic wrapper for resource list pages.
 * Provides consistent layout with header, stats, filters, and controls.
 *
 * @example
 * ```tsx
 * <ResourceListWrapper
 *   context="admin"
 *   title="Products"
 *   description="Manage your product catalog"
 *   stats={[
 *     { label: "Total", value: 150, icon: <BoxIcon /> },
 *     { label: "Active", value: 120 },
 *   ]}
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   createButton={<button>Add Product</button>}
 * >
 *   <ProductList />
 * </ResourceListWrapper>
 * ```
 */

import { ReactNode } from "react";

interface StatsCard {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}

interface ResourceListWrapperProps {
  /** Context for permission-based UI */
  context: "admin" | "seller" | "public";

  /** Page title */
  title: string;

  /** Optional description text */
  description?: string;

  /** Create/Add button component */
  createButton?: ReactNode;

  /** Stats cards to display */
  stats?: StatsCard[];

  /** Filter sidebar component (injectable) */
  filterSidebar?: ReactNode;

  /** Whether to show filter sidebar */
  showFilterSidebar?: boolean;

  /** Search input placeholder */
  searchPlaceholder?: string;

  /** Current search value */
  searchValue?: string;

  /** Search change handler */
  onSearchChange?: (value: string) => void;

  /** Current view mode */
  viewMode?: "grid" | "table";

  /** View mode change handler */
  onViewModeChange?: (mode: "grid" | "table") => void;

  /** Whether to show view toggle */
  showViewToggle?: boolean;

  /** Bulk actions bar component (injectable) */
  bulkActionsBar?: ReactNode;

  /** Export handler */
  onExport?: () => void;

  /** Whether to show export button */
  showExport?: boolean;

  /** Main content */
  children: ReactNode;

  /** Pagination component (injectable) */
  pagination?: ReactNode;

  /** Mobile filter component (injectable) */
  mobileFilterSidebar?: ReactNode;

  /** Mobile filter open state */
  mobileFilterOpen?: boolean;

  /** Mobile filter toggle handler */
  onMobileFilterToggle?: () => void;

  /** Custom icons (injectable) */
  icons?: {
    grid?: ReactNode;
    list?: ReactNode;
    download?: ReactNode;
    filter?: ReactNode;
  };
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default icons (inline SVG)
const defaultIcons = {
  grid: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  list: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  download: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
  filter: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  ),
};

export function ResourceListWrapper({
  context,
  title,
  description,
  createButton,
  stats,
  filterSidebar,
  showFilterSidebar = false,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  viewMode = "table",
  onViewModeChange,
  showViewToggle = true,
  bulkActionsBar,
  onExport,
  showExport = false,
  children,
  pagination,
  mobileFilterSidebar,
  mobileFilterOpen = false,
  onMobileFilterToggle,
  icons = defaultIcons,
}: ResourceListWrapperProps) {
  const isAdminOrSeller = context === "admin" || context === "seller";
  const mergedIcons = { ...defaultIcons, ...icons };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          {/* Title and Create Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            {createButton && <div>{createButton}</div>}
          </div>

          {/* Stats Cards */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-gradient-to-br p-4 rounded-lg",
                    stat.color ||
                      "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                  )}
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

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            {onSearchChange && (
              <div className="w-full md:w-96">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Mobile Filter Toggle */}
              {showFilterSidebar && mobileFilterSidebar && (
                <button
                  onClick={onMobileFilterToggle}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {mergedIcons.filter}
                  <span>Filters</span>
                </button>
              )}

              {/* View Toggle */}
              {showViewToggle && onViewModeChange && (
                <div className="flex bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => onViewModeChange("table")}
                    className={cn(
                      "px-3 py-2 transition-colors",
                      viewMode === "table"
                        ? "bg-yellow-500 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                    )}
                    aria-label="Table view"
                  >
                    {mergedIcons.list}
                  </button>
                  <button
                    onClick={() => onViewModeChange("grid")}
                    className={cn(
                      "px-3 py-2 transition-colors",
                      viewMode === "grid"
                        ? "bg-yellow-500 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                    )}
                    aria-label="Grid view"
                  >
                    {mergedIcons.grid}
                  </button>
                </div>
              )}

              {/* Export Button */}
              {isAdminOrSeller && showExport && onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {mergedIcons.download}
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkActionsBar && <div>{bulkActionsBar}</div>}

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          {showFilterSidebar && filterSidebar && (
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              {filterSidebar}
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
            {pagination && <div className="mt-6">{pagination}</div>}
          </main>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFilterOpen && mobileFilterSidebar && (
        <div className="lg:hidden">{mobileFilterSidebar}</div>
      )}
    </div>
  );
}

export default ResourceListWrapper;
