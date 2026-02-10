"use client";

import { ReactNode, useState, useMemo } from "react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { Spinner, Pagination } from "@/components";

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
  pageSize?: number;
  showPagination?: boolean;
  // Mobile view
  mobileCardRender?: (item: T) => ReactNode;
  // Custom empty state
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  // Table enhancements
  stickyHeader?: boolean;
  striped?: boolean;
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
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    if (!showPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, showPagination]);

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
      {/* Mobile Card View */}
      {mobileCardRender && (
        <div className={`md:hidden ${THEME_CONSTANTS.spacing.stack}`}>
          {paginatedData.map((item) => (
            <div key={keyExtractor(item)}>{mobileCardRender(item)}</div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      <div
        className={`${mobileCardRender ? "hidden md:block" : ""} border ${THEME_CONSTANTS.themed.borderColor} rounded-lg overflow-hidden`}
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

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
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
