"use client";

import { Button } from "@mohasinac/appkit/ui";
import { Card } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

/**
 * AdminFilterBar Component
 *
 * Card-wrapped grid of filter inputs (search, select, status tabs).
 * When `deferred={true}`, renders Apply and Reset buttons so filter changes
 * are only committed to the URL when the user explicitly applies them.
 *
 * @example
 * ```tsx
 * <AdminFilterBar deferred onApply={filters.apply} onReset={filters.reset} pendingCount={filters.pendingCount}>
 *   <Input placeholder="Search users..." />
 *   <Select>...</Select>
 * </AdminFilterBar>
 * ```
 */

interface AdminFilterBarProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  /** Wrap filter content in a Card. Defaults to true (admin pages). Set false for public/seller pages. */
  withCard?: boolean;
  /**
   * When true, renders Apply + Reset action buttons.
   * Filter changes are NOT written to the URL until `onApply` is called.
   * Pair with `usePendingFilters` for deferred URL state.
   */
  deferred?: boolean;
  /** Called when the Apply button is clicked (only used when `deferred=true`). */
  onApply?: () => void;
  /** Called when the Reset button is clicked (only used when `deferred=true`). */
  onReset?: () => void;
  /**
   * Number of pending (uncommitted) filter changes.
   * Shown in the Apply button label as "Apply (N)" when > 0.
   * The Reset button is hidden when this is 0.
   */
  pendingCount?: number;
}

export function AdminFilterBar({
  children,
  columns = 3,
  className = "",
  withCard = true,
  deferred = false,
  onApply,
  onReset,
  pendingCount = 0,
}: AdminFilterBarProps) {
  const { spacing, flex } = THEME_CONSTANTS;
  const t = useTranslations("filters");

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4",
  };

  const innerContent = (
    <>
      <div className={`grid ${gridCols[columns]} gap-4`}>{children}</div>
      {deferred && (
        <div className={`${flex.end} gap-2 mt-3`}>
          {pendingCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              {t("reset")}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onApply}>
            {pendingCount > 0 ? `${t("apply")} (${pendingCount})` : t("apply")}
          </Button>
        </div>
      )}
    </>
  );

  if (!withCard) return <div className={className}>{innerContent}</div>;

  return (
    <Card className={`${spacing.cardPadding} ${className}`}>
      {innerContent}
    </Card>
  );
}
