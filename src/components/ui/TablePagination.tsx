"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/utils";
import { Label, Span, Text } from "@mohasinac/appkit/ui";
import { Pagination, Select } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

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
  /**
   * Compact inline mode — renders only the page buttons (no count text, no
   * per-page selector). Intended for use inside a sticky toolbar bar.
   */
  compact?: boolean;
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
  compact = false,
}: TablePaginationProps) {
  const { themed } = THEME_CONSTANTS;
  const t = useTranslations("table");

  if (compact) {
    return (
      <div
        role="navigation"
        aria-label={t("paginationLabel")}
        className={`flex items-center gap-0.5 ${className}`}
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={isLoading}
          size="sm"
          maxVisible={5}
        />
      </div>
    );
  }

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div
      role="navigation"
      aria-label={t("paginationLabel")}
      className={[
        "flex flex-col sm:flex-row items-center gap-3 px-4 py-3",
        "border-t border-zinc-100 dark:border-slate-800/80",
        className,
      ].join(" ")}
    >
      {/* Result count */}
      <Text className="text-xs text-zinc-400 dark:text-slate-500 tabular-nums sm:mr-auto">
        {t("showing")}{" "}
        <Span className="font-semibold text-zinc-600 dark:text-slate-300">
          {from}–{to}
        </Span>{" "}
        {t("of")}{" "}
        <Span className="font-semibold text-zinc-600 dark:text-slate-300">
          {formatNumber(total)}
        </Span>{" "}
        {t("results")}
      </Text>

      {/* Pagination pill group */}
      <div className={`rounded-xl p-0.5 ${themed.bgSecondary} inline-flex`}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={isLoading}
        />
      </div>

      {/* Per-page selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-1.5 sm:ml-1">
          <Label
            htmlFor="page-size-select"
            className="text-xs text-zinc-400 dark:text-slate-500 whitespace-nowrap"
          >
            {t("perPage")}
          </Label>
          <Select
            id="page-size-select"
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            aria-label={t("perPage")}
            className="text-xs h-7 py-0 px-2 rounded-lg"
            options={pageSizeOptions.map((s) => ({
              value: String(s),
              label: String(s),
            }))}
          />
        </div>
      )}
    </div>
  );
}
