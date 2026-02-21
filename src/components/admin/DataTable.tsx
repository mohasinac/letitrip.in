"use client";

import { ReactNode, useState, useMemo } from "react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { Spinner, Pagination } from "@/components";

type ViewMode = "table" | "grid" | "list";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
  // Pagination props
  /** @deprecated Use externalPagination + <TablePagination> instead */
  pageSize?: number;
  /** @deprecated Use externalPagination + <TablePagination> instead */
  showPagination?: boolean;
  /** When true, disables internal pagination — render <TablePagination> externally. Default: false */
  externalPagination?: boolean;
  // Mobile view
  mobileCardRender?: (item: T) => ReactNode;
  // Custom empty state
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  // Table enhancements
  stickyHeader?: boolean;
  striped?: boolean;
  // View toggle
  /** Show Table / Grid / List mode toggle in the toolbar. Default: false */
  showViewToggle?: boolean;
  /** Controlled view mode. Use with onViewModeChange. */
  viewMode?: ViewMode;
  /** Uncontrolled default view mode. Default: 'table' */
  defaultViewMode?: ViewMode;
  /** Called when the user switches view mode. */
  onViewModeChange?: (mode: ViewMode) => void;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage,
  actions,
  pageSize = 10,
  showPagination = true,
  mobileCardRender,
  emptyIcon,
  emptyTitle,
  stickyHeader = false,
  striped = false,
  externalPagination = false,
  showViewToggle = false,
  viewMode: controlledViewMode,
  defaultViewMode = "table",
  onViewModeChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [internalViewMode, setInternalViewMode] =
    useState<ViewMode>(defaultViewMode);

  // Support both controlled and uncontrolled view mode
  const activeViewMode: ViewMode = controlledViewMode ?? internalViewMode;

  const handleViewModeChange = (mode: ViewMode) => {
    if (controlledViewMode === undefined) {
      setInternalViewMode(mode);
    }
    onViewModeChange?.(mode);
  };

  const handleSort = (key: string) => {
    const column = columns.find((c) => c.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      // Toggle direction: asc → desc → null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortKey && sortDirection) {
      sorted.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // String comparison
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Number/Date comparison
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [data, sortKey, sortDirection]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (externalPagination || !showPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, showPagination, externalPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  if (loading) {
    return (
      <div
        className={`border ${THEME_CONSTANTS.themed.borderColor} rounded-lg overflow-hidden`}
      >
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`border ${THEME_CONSTANTS.themed.borderColor} rounded-lg overflow-hidden`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            {emptyIcon || (
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            )}
            <h3
              className={`mt-4 text-sm font-semibold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              {emptyTitle || UI_LABELS.TABLE.NO_DATA_TITLE}
            </h3>
            <p
              className={`mt-1 text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {emptyMessage || UI_LABELS.TABLE.NO_DATA_DESCRIPTION}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      {/* View toggle toolbar */}
      {showViewToggle && (
        <div
          className="flex justify-end gap-1"
          role="toolbar"
          aria-label="View mode"
        >
          {/* Table mode — hidden on xs */}
          <button
            type="button"
            onClick={() => handleViewModeChange("table")}
            aria-label={UI_LABELS.ADMIN.TABLE_VIEW ?? "Table view"}
            aria-pressed={activeViewMode === "table"}
            className={`hidden sm:flex items-center justify-center p-2 rounded-lg ring-1 transition-colors ${
              activeViewMode === "table"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 ring-indigo-300"
                : `${THEME_CONSTANTS.themed.textSecondary} ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
          >
            {/* Table icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M3 6h18M3 14h18M3 18h18"
              />
            </svg>
          </button>

          {/* Grid mode */}
          <button
            type="button"
            onClick={() => handleViewModeChange("grid")}
            aria-label={UI_LABELS.ADMIN.GRID_VIEW ?? "Grid view"}
            aria-pressed={activeViewMode === "grid"}
            className={`flex items-center justify-center p-2 rounded-lg ring-1 transition-colors ${
              activeViewMode === "grid"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 ring-indigo-300"
                : `${THEME_CONSTANTS.themed.textSecondary} ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
          >
            {/* Grid icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </button>

          {/* List mode */}
          <button
            type="button"
            onClick={() => handleViewModeChange("list")}
            aria-label={UI_LABELS.ADMIN.LIST_VIEW ?? "List view"}
            aria-pressed={activeViewMode === "list"}
            className={`flex items-center justify-center p-2 rounded-lg ring-1 transition-colors ${
              activeViewMode === "list"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 ring-indigo-300"
                : `${THEME_CONSTANTS.themed.textSecondary} ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
          >
            {/* List icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Grid view */}
      {showViewToggle && activeViewMode === "grid" && mobileCardRender && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedData.map((item) => (
            <div key={keyExtractor(item)}>{mobileCardRender(item)}</div>
          ))}
        </div>
      )}

      {/* List view */}
      {showViewToggle && activeViewMode === "list" && mobileCardRender && (
        <div className="flex flex-col gap-2">
          {paginatedData.map((item) => (
            <div key={keyExtractor(item)}>{mobileCardRender(item)}</div>
          ))}
        </div>
      )}

      {/* Mobile Card View (CSS-driven, only when NOT using view toggle) */}
      {(!showViewToggle || activeViewMode === "table") && mobileCardRender && (
        <div className={`md:hidden ${THEME_CONSTANTS.spacing.stack}`}>
          {paginatedData.map((item) => (
            <div key={keyExtractor(item)}>{mobileCardRender(item)}</div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {(!showViewToggle || activeViewMode === "table") && (
        <div
          className={`border ${THEME_CONSTANTS.themed.borderColor} rounded-lg overflow-hidden`}
        >
          <div
            className={`overflow-x-auto ${stickyHeader ? "max-h-[600px] overflow-y-auto" : ""}`}
          >
            <table
              className={`min-w-full divide-y ${THEME_CONSTANTS.themed.divider}`}
            >
              <thead
                className={`${THEME_CONSTANTS.themed.bgTertiary} ${stickyHeader ? "sticky top-0 z-10" : ""}`}
              >
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`
                      px-6 py-3 text-left text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider
                      ${column.sortable ? `cursor-pointer select-none ${THEME_CONSTANTS.themed.hover}` : ""}
                    `}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && (
                          <span className="text-gray-400">
                            {sortKey === column.key ? (
                              sortDirection === "asc" ? (
                                <span>↑</span>
                              ) : (
                                <span>↓</span>
                              )
                            ) : (
                              <span className="opacity-30">↕</span>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions && (
                    <th
                      scope="col"
                      className={`px-6 py-3 text-right text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                    >
                      {UI_LABELS.TABLE.ACTIONS}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody
                className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.divider}`}
              >
                {paginatedData.map((item, index) => (
                  <tr
                    key={keyExtractor(item)}
                    className={`
                    ${striped && index % 2 === 1 ? THEME_CONSTANTS.themed.bgTertiary : ""}
                    ${onRowClick ? "cursor-pointer" : ""}
                    ${onRowClick ? THEME_CONSTANTS.themed.hoverCard : ""}
                    transition-colors duration-150
                  `}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${THEME_CONSTANTS.themed.textPrimary}`}
                      >
                        {column.render
                          ? column.render(item)
                          : (item[column.key] ?? "-")}
                      </td>
                    ))}
                    {actions && (
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!externalPagination && showPagination && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
