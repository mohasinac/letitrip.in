"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  mobileHide?: boolean;
}

interface MobileDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyState?: ReactNode;
  isLoading?: boolean;
  loadingRows?: number;
  renderMobileCard?: (item: T) => ReactNode;
  className?: string;
}

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
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
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
          <div className="text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
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
                className={cn(onRowClick && "cursor-pointer active:bg-gray-50")}
              >
                {renderMobileCard(item)}
              </div>
            );
          }

          // Default mobile card
          const visibleColumns = columns.filter((col) => !col.mobileHide);
          const primaryColumn = visibleColumns[0];
          const secondaryColumns = visibleColumns.slice(1, 3);

          return (
            <div
              key={key}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "bg-white border border-gray-200 rounded-lg p-4",
                onRowClick &&
                  "cursor-pointer hover:border-gray-300 active:bg-gray-50 transition-colors"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Primary info */}
                  {primaryColumn && (
                    <div className="font-medium text-gray-900 truncate">
                      {primaryColumn.render
                        ? primaryColumn.render(item)
                        : getValue(item, primaryColumn.key as string)}
                    </div>
                  )}

                  {/* Secondary info */}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {secondaryColumns.map((col) => (
                      <div key={col.key as string}>
                        <span className="text-gray-400">{col.header}: </span>
                        {col.render
                          ? col.render(item)
                          : getValue(item, col.key as string)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow indicator if clickable */}
                {onRowClick && (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
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
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "bg-white",
                  onRowClick &&
                    "cursor-pointer hover:bg-gray-50 transition-colors"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    className={cn(
                      "px-4 py-4 text-sm text-gray-900",
                      col.className
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
