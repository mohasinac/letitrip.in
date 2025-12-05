/**
 * @fileoverview React Component
 * @module src/components/mobile/MobileDataTable
 * @description This file contains the MobileDataTable component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Column interface
 * 
 * @interface
 * @description Defines the structure and contract for Column
 */
interface Column<T> {
  /** Key */
  key: keyof T | string;
  /** Header */
  header: string;
  /** Render */
  render?: (item: T) => ReactNode;
  /** Class Name */
  className?: string;
  /** Mobile Hide */
  mobileHide?: boolean;
}

/**
 * MobileDataTableProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MobileDataTableProps
 */
interface MobileDataTableProps<T> {
  /** Data */
  data: T[];
  /** Columns */
  columns: Column<T>[];
  /** Key Extractor */
  keyExtractor: (item: T) => string;
  /** On Row Click */
  onRowClick?: (item: T) => void;
  /** Empty State */
  emptyState?: ReactNode;
  /** Is Loading */
  isLoading?: boolean;
  /** Loading Rows */
  loadingRows?: number;
  /** Render Mobile Card */
  renderMobileCard?: (item: T) => ReactNode;
  /** Class Name */
  className?: string;
}

/**
 * Function: Mobile Data Table
 */
/**
 * Performs mobile data table operation
 *
 * @returns {any} The mobiledatatable result
 *
 * @example
 * MobileDataTable();
 */

/**
 * Performs mobile data table operation
 *
 * @returns {any} The mobiledatatable result
 *
 * @example
 * MobileDataTable();
 */

export function MobileDataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyState,
  isLoading,
  loadingRows = 5,
  renderMobileCard,
  className,
}: MobileDataTableProps<T>) {
  // Get value from nested key (e.g., "user.name")
  /**
   * Retrieves value
   *
   * @param {T} item - The item
   * @param {string} key - The key
   *
   * @returns {string} The value result
   */

  /**
   * Retrieves value
   *
   * @param {T} item - The item
   * @param {string} key - The key
   *
   * @returns {string} The value result
   */

  const getValue = (item: T, key: string): any => {
    const keys = key.split(".");
    let value: any = item;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn("py-12 text-center", className)}>
        {emptyState || (
          <div className="text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">No data to display</p>
          </div>
        )}
      </div>
    );
  }

  // Mobile card view (< lg)
  return (
    <div className={className}>
      {/* Mobile Cards - visible on mobile */}
      <div className="lg:hidden space-y-3">
        {data.map((item) => {
          const key = keyExtractor(item);

          // Use custom card renderer if provided
          if (renderMobileCard) {
            return (
              <div
                key={key}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => e.key === "Enter" && onRowClick?.(item)}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(onRowClick && "cursor-pointer active:bg-gray-50")}
              >
                {renderMobileCard(item)}
              </div>
            );
          }

          // Default mobile card
          /**
 * Performs visible columns operation
 *
 * @param {any} (col - The (col
 *
 * @returns {any} The visiblecolumns result
 *
 */
const visibleColumns = columns.filter((col) => !col.mobileHide);
          const primaryColumn = visibleColumns[0];
          const secondaryColumns = visibleColumns.slice(1, 3);

          return (
            <div
              key={key}
              onClick={() => onRowClick?.(item)}
              onKeyDown={(e) => e.key === "Enter" && onRowClick?.(item)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={cn(
                "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                onRowClick &&
                  "cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 active:bg-gray-50 dark:active:bg-gray-700 transition-colors",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Primary info */}
                  {primaryColumn && (
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {primaryColumn.render
                        ? primaryColumn.render(item)
                        : getValue(item, primaryColumn.key as string)}
                    </div>
                  )}

                  {/* Secondary info */}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    {secondaryColumns.map((col) => (
                      <div key={col.key as string}>
                        <span className="text-gray-400 dark:text-gray-500">
                          {col.header}:{" "}
                        </span>
                        {col.render
                          ? col.render(item)
                          : getValue(item, col.key as string)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow indicator if clickable */}
                {onRowClick && (
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table - visible on lg+ */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "bg-white dark:bg-gray-900",
                  onRowClick &&
                    "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    className={cn(
                      "px-4 py-4 text-sm text-gray-900 dark:text-gray-100",
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : getValue(item, col.key as string)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
