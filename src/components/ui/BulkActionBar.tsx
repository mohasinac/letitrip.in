"use client";

/**
 * BulkActionBar
 *
 * A compact action bar that appears at the top of the content area whenever
 * one or more list items are selected.  Shows the selection count, a ✕ button
 * to deselect everything, and action button slots provided by the caller.
 *
 * Public pages pass cart / wishlist buttons.
 * Admin / seller pages pass edit, delete, export, approve, etc.
 *
 * The bar is rendered by ListingLayout automatically when selectedCount > 0,
 * but can also be used standalone above a DataTable.
 *
 * @example
 * ```tsx
 * // Public product listing
 * <BulkActionBar
 *   selectedCount={selectedIds.length}
 *   onClearSelection={() => setSelectedIds([])}
 * >
 *   <Button size="sm" variant="primary" onClick={addAllToCart}>
 *     {t('addAllToCart')}
 *   </Button>
 *   <Button size="sm" variant="outline" onClick={addAllToWishlist}>
 *     {t('addAllToWishlist')}
 *   </Button>
 * </BulkActionBar>
 *
 * // Admin product listing
 * <BulkActionBar
 *   selectedCount={selectedIds.length}
 *   onClearSelection={() => setSelectedIds([])}
 * >
 *   <Button size="sm" variant="secondary" onClick={bulkExport}>Export</Button>
 *   <Button size="sm" variant="warning"  onClick={bulkUnpublish}>Unpublish</Button>
 *   <Button size="sm" variant="danger"   onClick={bulkDelete}>Delete</Button>
 * </BulkActionBar>
 * ```
 */

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button, Text } from "@/components";

export interface BulkActionBarProps {
  /** Number of currently selected items */
  selectedCount: number;
  /** Called when the user clicks the ✕ deselect button */
  onClearSelection?: () => void;
  /** Action buttons — layout is flex-row, wraps on narrow viewports */
  children?: ReactNode;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  children,
}: BulkActionBarProps) {
  const t = useTranslations("listingLayout");
  const tActions = useTranslations("actions");

  if (selectedCount === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 animate-in fade-in slide-in-from-top-1 duration-150"
      role="region"
      aria-live="polite"
      aria-label={t("bulkActionsRegion")}
    >
      {/* ── Count + deselect ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          aria-label={tActions("clearSelection")}
          className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-md"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
        <Text
          size="sm"
          weight="semibold"
          className="text-indigo-700 dark:text-indigo-300"
        >
          {t("selectedCount", { count: selectedCount })}
        </Text>
      </div>

      {/* ── Divider ── */}
      <div
        className="h-5 w-px bg-indigo-200 dark:bg-indigo-700 flex-shrink-0"
        aria-hidden="true"
      />

      {/* ── Action buttons ── */}
      {children && (
        <div className="flex items-center flex-wrap gap-2">{children}</div>
      )}
    </div>
  );
}
