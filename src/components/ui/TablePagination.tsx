"use client";

import { Pagination } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  /** Number of items per page — used to compute "Showing X–Y of Z" */
  pageSize: number;
  /** Total number of matching records across all pages */
  total: number;
  onPageChange: (page: number) => void;
  /** Called when the user changes the per-page selector */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  /** Disables controls while data is loading */
  isLoading?: boolean;
  className?: string;
}

/**
 * TablePagination
 *
 * Combines result count text, the Pagination component, and an optional
 * per-page selector into a single row footer. Tier-1 shared primitive.
 *
 * @example
 * ```tsx
 * <TablePagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   pageSize={25}
 *   total={243}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
  className = "",
}: TablePaginationProps) {
  const { themed, spacing } = THEME_CONSTANTS;

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div
      role="navigation"
      aria-label={UI_LABELS.TABLE.PAGINATION_LABEL}
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${spacing.padding.md} border-t ${themed.border} ${className}`}
    >
      {/* Result count */}
      <p className={`text-sm ${themed.textSecondary} tabular-nums`}>
        {UI_LABELS.TABLE.SHOWING}{" "}
        <span className={`font-medium ${themed.textPrimary}`}>
          {from}–{to}
        </span>{" "}
        {UI_LABELS.TABLE.OF}{" "}
        <span className={`font-medium ${themed.textPrimary}`}>
          {total.toLocaleString()}
        </span>{" "}
        {UI_LABELS.TABLE.RESULTS}
      </p>

      <div className="flex items-center gap-4">
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={isLoading}
        />

        {/* Per-page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size-select"
              className={`text-sm ${themed.textSecondary} whitespace-nowrap`}
            >
              {UI_LABELS.TABLE.PER_PAGE}
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              aria-label={UI_LABELS.TABLE.PER_PAGE}
              className={`text-sm ${THEME_CONSTANTS.input.base}`}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
