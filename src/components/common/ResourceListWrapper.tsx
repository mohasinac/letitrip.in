"use client";

import { ReactNode } from "react";
import { Grid, List, Download, Filter } from "lucide-react";

interface StatsCard {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}

interface ResourceListWrapperProps {
  // Context
  context: "admin" | "seller" | "public";

  // Header
  title: string;
  description?: string;
  createButton?: ReactNode;

  // Stats Cards (optional)
  stats?: StatsCard[];

  // Filter Sidebar (optional - pass your own component)
  filterSidebar?: ReactNode;
  showFilterSidebar?: boolean;

  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // View Toggle (optional)
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  showViewToggle?: boolean;

  // Bulk Actions Bar (pass your own component if needed)
  bulkActionsBar?: ReactNode;

  // Export (admin/seller only)
  onExport?: () => void;
  showExport?: boolean;

  // Content
  children: ReactNode;

  // Pagination
  pagination?: ReactNode;

  // Mobile Filter (pass your own component)
  mobileFilterSidebar?: ReactNode;
  mobileFilterOpen?: boolean;
  onMobileFilterToggle?: () => void;
}

export default function ResourceListWrapper({
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
}: ResourceListWrapperProps) {
  const isAdminOrSeller = context === "admin" || context === "seller";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Title and Create Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
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
                  className={`bg-gradient-to-br ${stat.color || "from-blue-50 to-blue-100"} p-4 rounded-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    {stat.icon && (
                      <div className="text-gray-600">{stat.icon}</div>
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Mobile Filter Button */}
              {showFilterSidebar && onMobileFilterToggle && (
                <button
                  onClick={onMobileFilterToggle}
                  className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              )}

              {/* View Toggle */}
              {showViewToggle && onViewModeChange && (
                <div className="hidden md:flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => onViewModeChange("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-yellow-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange("table")}
                    className={`p-2 rounded ${viewMode === "table" ? "bg-yellow-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    aria-label="Table view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Export Button */}
              {isAdminOrSeller && showExport && onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Export</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar (Desktop) */}
          {showFilterSidebar && filterSidebar && (
            <div className="hidden md:block w-64 flex-shrink-0">
              {filterSidebar}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Bulk Action Bar */}
            {bulkActionsBar && <div className="mb-4">{bulkActionsBar}</div>}

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm border">
              {children}
            </div>

            {/* Pagination */}
            {pagination && <div className="mt-6">{pagination}</div>}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {mobileFilterSidebar}
    </div>
  );
}
