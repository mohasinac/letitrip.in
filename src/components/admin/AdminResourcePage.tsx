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
interface InlineField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface BulkActionConfig {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "danger";
  requiresConfirmation?: boolean;
}

export interface AdminResourcePageProps<T> {
  // Resource Configuration
  resourceName: string;
  resourceNamePlural: string;

  // Data Loading
  loadData: (options: LoadDataOptions) => Promise<LoadDataResult<T>>;

  // Column Configuration
  columns: ResourceColumn<T>[];
  fields: InlineField[];

  // Actions
  bulkActions?: BulkAction[];
  onSave?: (id: string, data: Partial<T>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;

  // Filters (optional)
  filters?: FilterConfig[];

  // Stats (optional)
  stats?: ResourceStat[];

  // Custom Rendering
  renderMobileCard?: (item: T) => ReactNode;
  renderGridCard?: (item: T) => ReactNode;
}

export interface LoadDataOptions {
  cursor: string | null;
  search?: string;
  filters?: Record<string, string>;
}

export interface LoadDataResult<T> {
  items: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface ResourceColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "text" | "date";
  options?: { value: string; label: string }[];
}

export interface ResourceStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}

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
  const loadItems = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await loadData({
        cursor: cursors[currentPage - 1],
        search: debouncedSearchQuery,
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
        component: "AdminResourcePage.loadItems",
        resource: resourceNamePlural,
        page: currentPage,
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
  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  // Save handler
  const handleSave = async (id: string, data: Partial<T>) => {
    if (!onSave) return;

    try {
      await onSave(id, data);
      toast.success(`${resourceName} updated successfully`);
      loadItems();
    } catch (err) {
      logError(err as Error, {
        component: "AdminResourcePage.handleSave",
        resource: resourceName,
        itemId: id,
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
