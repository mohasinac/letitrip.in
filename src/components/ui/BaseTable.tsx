/**
 * @fileoverview React Component
 * @module src/components/ui/BaseTable
 * @description This file contains the BaseTable component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";

/**
 * BaseTableProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BaseTableProps
 */
export interface BaseTableProps<T> {
  /** Data */
  data: T[];
  /** Columns */
  columns: TableColumn<T>[];
  /** Key Extractor */
  keyExtractor: (row: T, index: number) => string | number;
  /** Is Loading */
  isLoading?: boolean;
  /** Empty Message */
  emptyMessage?: string;
  /** On Row Click */
  onRowClick?: (row: T) => void;
  /** Row Class Name */
  rowClassName?: (row: T) => string;
  /** Sticky Header */
  stickyHeader?: boolean;
  /** Sticky First Column */
  stickyFirstColumn?: boolean;
  /** Compact */
  compact?: boolean;
}

/**
 * TableColumn interface
 * 
 * @interface
 * @description Defines the structure and contract for TableColumn
 */
export interface TableColumn<T> {
  /** Key */
  key: string;
  /** Label */
  label: string;
  /** Width */
  width?: string;
  /** Align */
  align?: "left" | "center" | "right";
  /** Sortable */
  sortable?: boolean;
  /** Render */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Header Render */
  headerRender?: () => React.ReactNode;
}

/**
 * BaseTable - Reusable table component with common patterns
 */
/**
 * Performs base table operation
 *
 * @returns {any} The basetable result
 *
 * @example
 * BaseTable();
 */

/**
 * Performs base table operation
 *
 * @returns {any} The basetable result
 *
 * @example
 * BaseTable();
 */

export function BaseTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  rowClassName,
  stickyHeader = true,
  stickyFirstColumn = false,
  compact = false,
}: BaseTableProps<T>) {
  const cellPadding = compact ? "px-3 py-2" : "px-6 py-4";

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellPadding} text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td key={column.key} className={cellPadding}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const alignmentClasses = {
    /** Left */
    left: "text-left",
    /** Center */
    center: "text-center",
    /** Right */
    right: "text-right",
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        <thead
          className={`bg-gray-50 dark:bg-gray-900 ${
            stickyHeader ? "sticky top-0 z-20" : ""
          }`}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`
                  ${cellPadding} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
                  ${alignmentClasses[column.align || "left"]}
                  ${
                    stickyFirstColumn && index === 0
                      ? "sticky left-0 z-30 bg-gray-50 dark:bg-gray-900"
                      : ""
                  }
                  ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      : ""
                  }
                `}
                style={{ width: column.width }}
              >
                {column.headerRender ? column.headerRender() : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row, rowIndex)}
              className={`
                ${
                  onRowClick
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    : ""
                }
                ${rowClassName ? rowClassName(row) : ""}
              `}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => {
                /**
                 * Performs value operation
                 *
                 * @returns {any} The value result
                 */

                /**
                 * Performs value operation
                 *
                 * @returns {any} The value result
                 */

                const value = (row as any)[column.key];
                return (
                  <td
                    key={column.key}
                    className={`
                      ${cellPadding} text-sm text-gray-900 dark:text-white whitespace-nowrap
                      ${alignmentClasses[column.align || "left"]}
                      ${
                        stickyFirstColumn && colIndex === 0
                          ? "sticky left-0 z-10 bg-white dark:bg-gray-800"
                          : ""
                      }
                    `}
                  >
                    {column.render
                      ? column.render(value, row, rowIndex)
                      : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
