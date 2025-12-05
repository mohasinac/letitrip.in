/**
 * @fileoverview React Component
 * @module src/components/admin/AdminResourcePage
 * @description This file contains the AdminResourcePage component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { BulkActionBar } from "@/components/common/BulkActionBar";
import { TableCheckbox } from "@/components/common/TableCheckbox";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/useMobile";
import { logError } from "@/lib/firebase-error-logger";
import type { BulkAction } from "@/types/inline-edit";
import {
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Loader2,
  Search,
} from "lucide-react";
import { ReactNode, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// Define inline types since they're not exported
/**
 * InlineField interface
 * 
 * @interface
 * @description Defines the structure and contract for InlineField
 */
interface InlineField {
  /** Name */
  name: string;
  /** Label */
  label: string;
  /** Type */
  type: string;
  /** Required */
  required?: boolean;
  /** Options */
  options?: Array<{ value: string; label: string }>;
}

/**
 * BulkActionConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for BulkActionConfig
 */
interface BulkActionConfig {
  /** Id */
  id: string;
  /** Label */
  label: string;
  /** Icon */
  icon?: string;
  /** Variant */
  variant?: "default" | "danger";
  /** Requires Confirmation */
  requiresConfirmation?: boolean;
}

/**
 * AdminResourcePageProps interface
 * 
 * @interface
 * @description Defines the structure and contract for AdminResourcePageProps
 */
export interface AdminResourcePageProps<T> {
  // Resource Configuration
  /** Resource Name */
  resourceName: string;
  /** Resource Name Plural */
  resourceNamePlural: string;

  // Data Loading
  /** Load Data */
  loadData: (options: LoadDataOptions) => Promise<LoadDataResult<T>>;

  // Column Configuration
  /** Columns */
  columns: ResourceColumn<T>[];
  /** Fields */
  fields: InlineField[];

  // Actions
  /** Bulk Actions */
  bulkActions?: BulkAction[];
  /** On Save */
  onSave?: (id: string, data: Partial<T>) => Promise<void>;
  /** On Delete */
  onDelete?: (id: string) => Promise<void>;

  // Filters (optional)
  /** Filters */
  filters?: FilterConfig[];

  // Stats (optional)
  /** Stats */
  stats?: ResourceStat[];

  // Custom Rendering
  /** Render Mobile Card */
  renderMobileCard?: (item: T) => ReactNode;
  /** Render Grid Card */
  renderGridCard?: (item: T) => ReactNode;
}

/**
 * LoadDataOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for LoadDataOptions
 */
export interface LoadDataOptions {
  /** Cursor */
  cursor: string | null;
  /** Search */
  search?: string;
  /** Filters */
  filters?: Record<string, string>;
}

/**
 * LoadDataResult interface
 * 
 * @interface
 * @description Defines the structure and contract for LoadDataResult
 */
export interface LoadDataResult<T> {
  /** Items */
  items: T[];
  /** Next Cursor */
  nextCursor: string | null;
  /** Has Next Page */
  hasNextPage: boolean;
}

/**
 * ResourceColumn interface
 * 
 * @interface
 * @description Defines the structure and contract for ResourceColumn
 */
export interface ResourceColumn<T> {
  /** Key */
  key: string;
  /** Label */
  label: string;
  /** Render */
  render: (item: T) => ReactNode;
  /** Sortable */
  sortable?: boolean;
  /** Width */
  width?: string;
}

/**
 * FilterConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for FilterConfig
 */
export interface FilterConfig {
  /** Key */
  key: string;
  /** Label */
  label: string;
  /** Type */
  type: "select" | "text" | "date";
  /** Options */
  options?: { value: string; label: string }[];
}

/**
 * ResourceStat interface
 * 
 * @interface
 * @description Defines the structure and contract for ResourceStat
 */
export interface ResourceStat {
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
 * Function: Admin Resource Page
 */
/**
 * Performs admin resource page operation
 *
 * @returns {string} The adminresourcepage result
 *
 * @example
 * AdminResourcePage();
 */

/**
 * Performs admin resource page operation
 *
 * @returns {string} The adminresourcepage result
 *
 * @example
 * AdminResourcePage();
 */

export function AdminResourcePage<T extends { id: string }>({
  resourceName,
  resourceNamePlural,
  loadData,
  columns,
  fields,
  bulkActions = [],
  onSave,
  onDelete,
  filters = [],
  stats = [],
  renderMobileCard,
  renderGridCard,
}: AdminResourcePageProps<T>) {
  const isMobile = useIsMobile();

  // Data state
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Selection & Editing
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Loading ref
  const hasLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  // Load items
  /**
 * Performs load items operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loaditems result
 *
 */
const loadItems = useCallback(async () => {
/**
 * Performs result operation
 *
 * @param {object} {
        
        cursor - The {
        
        cursor
 *
 * @returns {any} The result result
 *
 */
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await loadData({
        /** Cursor */
        cursor: cursors[currentPage - 1],
        /** Search */
        search: debouncedSearchQuery,
        /** Filters */
        filters: activeFilters,
      });

      setItems(result.items);
      setHasNextPage(result.hasNextPage);

      // Update cursors for next page
      if (result.nextCursor && !cursors.includes(result.nextCursor)) {
        setCursors((prev) => [...prev, result.nextCursor]);
      }
    } catch (err) {
      logError(err as Error, {
        /** Component */
        component: "AdminResourcePage.loadItems",
        /** Metadata */
        metadata: { resource: resourceNamePlural, page: currentPage },
      });
      setError(`Failed to load ${resourceNamePlural}`);
      toast.error(`Failed to load ${resourceNamePlural}`);
    } finally {
      setLoading(false);
      loadingRef.current = false;
      hasLoadedRef.current = true;
    }
  }, [
    cursors,
    currentPage,
    debouncedSearchQuery,
    activeFilters,
    loadData,
    resourceNamePlural,
  ]);

  // Pagination handlers
  /**
   * Handles next page event
   *
   * @returns {any} The handlenextpage result
   */

  /**
   * Handles next page event
   *
   * @returns {any} The handlenextpage result
   */

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  /**
   * Handles prev page event
   *
   * @returns {any} The handleprevpage result
   */

  /**
   * Handles prev page event
   *
   * @returns {any} The handleprevpage result
   */

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Selection handlers
  /**
   * Handles select all event
   *
   * @returns {any} The handleselectall result
   */

  /**
   * Handles select all event
   *
   * @returns {any} The handleselectall result
   */

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  /**
   * Handles select one event
   *
   * @param {string} id - Unique identifier
   *
   * @returns {string} The handleselectone result
   */

  /**
   * Handles select one event
   *
   * @param {string} id - Unique identifier
   *
   * @returns {string} The handleselectone result
   */

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  // Save handler
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<T>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<T>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<T>) => {
    if (!onSave) return;

    try {
      await onSave(id, data);
      toast.success(`${resourceName} updated successfully`);
      loadItems();
    } catch (err) {
      logError(err as Error, {
        /** Component */
        component: "AdminResourcePage.handleSave",
        /** Metadata */
        metadata: { resource: resourceName, itemId: id },
      });
      toast.error(`Failed to update ${resourceName}`);
    }
  };

  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {resourceNamePlural}
        </h1>

        {/* View Toggle */}
        {renderGridCard && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md ${
                viewMode === "table"
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                {stat.icon && <div className={stat.color}>{stat.icon}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${resourceNamePlural.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {filters.map((filter) => (
          <select
            key={filter.key}
            value={activeFilters[filter.key] || "all"}
            onChange={(e) =>
              setActiveFilters((prev) => ({
                ...prev,
                [filter.key]: e.target.value,
              }))
            }
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All {filter.label}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && bulkActions.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onAction={async (actionId) => {
            // Bulk action handling should be implemented by parent component
            toast.info(
              `Bulk action: ${actionId} on ${selectedIds.length} items`,
            );
          }}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Content */}
      {loading && !hasLoadedRef.current ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No {resourceNamePlural.toLowerCase()} found
          </p>
        </div>
      ) : viewMode === "grid" && renderGridCard ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id}>{renderGridCard(item)}</div>
          ))}
        </div>
      ) : isMobile && renderMobileCard ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id}>{renderMobileCard(item)}</div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-12 px-4 py-3">
                  <TableCheckbox
                    checked={selectedIds.length === items.length}
                    onChange={handleSelectAll}
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="w-12 px-4 py-3">
                    <TableCheckbox
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectOne(item.id)}
                    />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
