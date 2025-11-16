"use client";

import React from "react";

export interface BaseTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  compact?: boolean;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

/**
 * BaseTable - Reusable table component with common patterns
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
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td key={column.key} className={cellPadding}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
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
      <div className="w-full text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead
          className={`bg-gray-50 ${stickyHeader ? "sticky top-0 z-20" : ""}`}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`
                  ${cellPadding} text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${alignmentClasses[column.align || "left"]}
                  ${
                    stickyFirstColumn && index === 0
                      ? "sticky left-0 z-30 bg-gray-50"
                      : ""
                  }
                  ${column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}
                `}
                style={{ width: column.width }}
              >
                {column.headerRender ? column.headerRender() : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row, rowIndex)}
              className={`
                ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                ${rowClassName ? rowClassName(row) : ""}
              `}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => {
                const value = (row as any)[column.key];
                return (
                  <td
                    key={column.key}
                    className={`
                      ${cellPadding} text-sm text-gray-900 whitespace-nowrap
                      ${alignmentClasses[column.align || "left"]}
                      ${
                        stickyFirstColumn && colIndex === 0
                          ? "sticky left-0 z-10 bg-white"
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
