"use client";

import { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onSort,
  sortKey,
  sortDirection = "asc",
  isLoading = false,
  emptyMessage = "No data available",
  className = "",
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [localSortKey, setLocalSortKey] = useState<string | null>(null);
  const [localSortDirection, setLocalSortDirection] = useState<"asc" | "desc">(
    "asc"
  );

  const activeSortKey = sortKey || localSortKey;
  const activeSortDirection = sortKey ? sortDirection : localSortDirection;

  const handleSort = (key: string) => {
    const newDirection =
      activeSortKey === key && activeSortDirection === "asc" ? "desc" : "asc";

    if (onSort) {
      onSort(key, newDirection);
    } else {
      setLocalSortKey(key);
      setLocalSortDirection(newDirection);
    }
  };

  const sortedData = useMemo(() => {
    if (!activeSortKey) return data;

    return [...data].sort((a: any, b: any) => {
      const aVal = a[activeSortKey];
      const bVal = b[activeSortKey];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return activeSortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, activeSortKey, activeSortDirection]);

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className={`w-full ${className}`}>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
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
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
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
      <div className="w-full text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full ${className}`}>
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  column.sortable
                    ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    : ""
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="text-gray-400 dark:text-gray-500">
                      {activeSortKey === column.key
                        ? activeSortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedData.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={`${
                onRowClick
                  ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  : ""
              } ${rowClassName ? rowClassName(row) : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {column.render
                    ? column.render((row as any)[column.key], row)
                    : (row as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
