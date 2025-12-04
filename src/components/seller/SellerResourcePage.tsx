"use client";

import { useState, useCallback, useRef, ReactNode } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/useMobile";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { TableCheckbox } from "@/components/common/TableCheckbox";
import type { BulkAction } from "@/types/inline-edit";

// Define inline types
interface InlineField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface SellerResourcePageProps<T> {
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

export function SellerResourcePage<T extends { id: string }>({
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
}: SellerResourcePageProps<T>) {
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
    {}
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
        cursor: cursors[currentPage - 1] || null,
        search: debouncedSearchQuery,
        filters: activeFilters,
      });

      setItems(result.items);
      setHasNextPage(result.hasNextPage);

      // Update cursors
      if (result.nextCursor && !cursors.includes(result.nextCursor)) {
        setCursors((prev) => {
          const newCursors = [...prev];
          newCursors[currentPage] = result.nextCursor;
          return newCursors;
        });
      }

      hasLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load items:", err);
      setError(err instanceof Error ? err.message : "Failed to load items");
      toast.error(`Failed to load ${resourceNamePlural}`);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [
    currentPage,
    cursors,
    debouncedSearchQuery,
    activeFilters,
    loadData,
    resourceNamePlural,
  ]);

  // Initial load
  useState(() => {
    if (!hasLoadedRef.current) {
      loadItems();
    }
  });

  // Reload on filter changes
  useState(() => {
    if (hasLoadedRef.current) {
      setCurrentPage(1);
      setCursors([null]);
      loadItems();
    }
  }, [debouncedSearchQuery, activeFilters]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle pagination
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

  // Handle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Handle bulk actions
  const handleBulkAction = async (actionId: string) => {
    if (selectedIds.length === 0) {
      toast.error("No items selected");
      return;
    }

    toast.success(
      `${actionId} applied to ${selectedIds.length} ${
        selectedIds.length === 1 ? resourceName : resourceNamePlural
      }`
    );
    setSelectedIds([]);
    loadItems();
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {resourceNamePlural}
            </h1>
            {stats.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {stat.icon}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}:{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${
                  viewMode === "table"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${resourceNamePlural}...`}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-[180px]">
              <select
                value={activeFilters[filter.key] || "all"}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {filter.type === "select" && filter.options ? (
                  filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                ) : (
                  <option value="all">All</option>
                )}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && bulkActions.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds([])}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading && !hasLoadedRef.current ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadItems}
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">
              No {resourceNamePlural} found
            </p>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {bulkActions.length > 0 && (
                    <th className="p-4 text-left">
                      <TableCheckbox
                        checked={selectedIds.length === items.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    {bulkActions.length > 0 && (
                      <td className="p-4">
                        <TableCheckbox
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="p-4 text-sm text-gray-900 dark:text-white"
                      >
                        {column.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) =>
              renderGridCard ? (
                <div key={item.id}>{renderGridCard(item)}</div>
              ) : (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <p className="text-sm text-gray-900 dark:text-white">
                    {item.id}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
