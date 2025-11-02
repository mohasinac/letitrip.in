"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreVertical,
  Search,
} from "lucide-react";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedDropdown } from "@/components/ui/unified/Dropdown";
import { UnifiedSkeleton } from "@/components/ui/unified/Skeleton";
import { UnifiedBadge } from "@/components/ui/unified/Badge";

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface BulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "success"
    | "warning";
  icon?: React.ReactNode;
}

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
}

export interface ModernDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  rowActions?: RowAction<T>[] | ((row: T) => RowAction<T>[]);
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  getRowId?: (row: T) => string;
}

export function ModernDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  selectable = false,
  bulkActions = [],
  rowActions = [],
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  searchable = false,
  onSearch,
  emptyMessage = "No data available",
  className = "",
  rowClassName = "",
  getRowId = (row) => row.id,
}: ModernDataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  // Handle row selection
  const toggleRow = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map(getRowId)));
    }
  };

  const isAllSelected =
    sortedData.length > 0 && selectedRows.size === sortedData.length;
  const isSomeSelected =
    selectedRows.size > 0 && selectedRows.size < sortedData.length;

  // Pagination calculations
  const totalPages = totalItems
    ? Math.ceil(totalItems / pageSize)
    : Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = totalItems
    ? sortedData
    : sortedData.slice(startIndex, endIndex);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top bar - Search and bulk actions */}
      {(searchable || (selectable && selectedRows.size > 0)) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}

          {/* Bulk actions */}
          {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-textSecondary">
                {selectedRows.size} selected
              </span>
              {bulkActions.map((action, index) => (
                <UnifiedButton
                  key={index}
                  variant={action.variant || "primary"}
                  size="sm"
                  onClick={() => action.onClick(Array.from(selectedRows))}
                  icon={action.icon}
                >
                  {action.label}
                </UnifiedButton>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full">
          {/* Table header */}
          <thead className="bg-surfaceVariant border-b border-border">
            <tr>
              {/* Checkbox column */}
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={toggleAll}
                    className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  />
                </th>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-${
                    column.align || "left"
                  } text-sm font-semibold text-text ${
                    column.sortable ? "cursor-pointer hover:bg-surface/50" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      column.align === "center"
                        ? "justify-center"
                        : column.align === "right"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortColumn === column.key ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          )
                        ) : (
                          <div className="text-textSecondary opacity-50">
                            <ChevronUp className="w-4 h-4 -mb-1" />
                            <ChevronDown className="w-4 h-4 -mt-1" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {((Array.isArray(rowActions) && rowActions.length > 0) ||
                typeof rowActions === "function") && (
                <th className="px-4 py-3 w-12 text-center text-sm font-semibold text-text">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-border">
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index}>
                  {selectable && (
                    <td className="px-4 py-3">
                      <UnifiedSkeleton width="16px" height="16px" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <UnifiedSkeleton height="20px" />
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td className="px-4 py-3">
                      <UnifiedSkeleton width="24px" height="24px" />
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (rowActions.length > 0 ? 1 : 0)
                  }
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-surfaceVariant rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-textSecondary" />
                    </div>
                    <p className="text-textSecondary">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((row, rowIndex) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.has(rowId);
                const customRowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName;

                return (
                  <tr
                    key={rowId}
                    className={`transition-colors hover:bg-surfaceVariant ${
                      isSelected ? "bg-primary/5" : ""
                    } ${customRowClass}`}
                  >
                    {/* Checkbox */}
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowId)}
                          className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-${
                          column.align || "left"
                        } text-sm text-text`}
                      >
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key]}
                      </td>
                    ))}

                    {/* Row actions */}
                    {(() => {
                      const actions =
                        typeof rowActions === "function"
                          ? rowActions(row)
                          : rowActions;

                      return actions.length > 0 ? (
                        <td className="px-4 py-3 text-center">
                          <UnifiedDropdown
                            trigger={
                              <button className="p-1 hover:bg-surfaceVariant rounded transition-colors">
                                <MoreVertical className="w-5 h-5 text-textSecondary" />
                              </button>
                            }
                            items={actions.map((action, idx) => ({
                              id: `action-${idx}`,
                              label: action.label,
                              onClick: () => action.onClick(row),
                              icon: action.icon,
                            }))}
                            placement="bottom-end"
                          />
                        </td>
                      ) : null;
                    })()}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && paginatedData.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Page size selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-textSecondary">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Page info */}
          <div className="text-sm text-textSecondary">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, totalItems || sortedData.length)} of{" "}
            {totalItems || sortedData.length} results
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(1)}
              disabled={currentPage === 1}
              className="p-2 text-textSecondary hover:text-text hover:bg-surfaceVariant rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-textSecondary hover:text-text hover:bg-surfaceVariant rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "text-text hover:bg-surfaceVariant"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-textSecondary hover:text-text hover:bg-surfaceVariant rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-textSecondary hover:text-text hover:bg-surfaceVariant rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile card view (responsive) */}
      <style jsx>{`
        @media (max-width: 768px) {
          table {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
