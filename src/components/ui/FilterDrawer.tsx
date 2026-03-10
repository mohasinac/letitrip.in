"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, DrawerFormFooter, SideDrawer, Span } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

interface FilterDrawerProps {
  /** FilterFacetSection nodes or any filter content */
  children: ReactNode;
  /**
   * Controlled open state. When provided, the component does not manage
   * its own open state — the parent controls it entirely.
   */
  open?: boolean;
  /**
   * Called when the drawer requests to be closed (X button or overlay click).
   * Required when `open` is provided.
   */
  onClose?: () => void;
  /** Called when the user clicks "Apply" */
  onApply?: () => void;
  /**
   * Called when the user clicks "Reset all".
   * Replaces the old `onClearAll` prop.
   */
  onReset?: () => void;
  /** Number of currently active (URL-committed) filters — shows a badge on the trigger */
  activeCount?: number;
  /**
   * Number of currently pending (uncommitted) filter selections.
   * When > 0, shown as a numeric badge on the Apply button.
   */
  pendingCount?: number;
  /** Drawer heading. Defaults to t('filters.title') */
  title?: string;
  /** Accessible label for the trigger button */
  triggerLabel?: string;
  /** Extra class names on the trigger button */
  triggerClassName?: string;
}

/**
 * FilterDrawer
 *
 * A left-side SideDrawer that contains filter facets. Includes a trigger
 * button showing an active-filter badge, and footer "Reset all" / "Apply"
 * actions using DrawerFormFooter.
 *
 * Supports two open-state modes:
 * - **Uncontrolled** (default): manages its own `isOpen` state. Trigger button
 *   is rendered automatically.
 * - **Controlled**: pass `open` + `onClose` — the trigger button is NOT rendered.
 *   The parent is responsible for opening and closing the drawer.
 *
 * For deferred filter apply (recommended), pair with `usePendingFilters`:
 * ```tsx
 * const filters = usePendingFilters({ table, keys: ['status', 'category'] });
 * <FilterDrawer
 *   open={drawerOpen}
 *   onClose={() => { setDrawerOpen(false); filters.reset(); }}
 *   onApply={() => { filters.apply(); setDrawerOpen(false); }}
 *   onReset={() => filters.clear()}
 *   activeCount={filters.appliedCount}
 *   pendingCount={filters.pendingCount}
 * >
 *   <FilterFacetSection ... />
 * </FilterDrawer>
 * ```
 */
export function FilterDrawer({
  children,
  open: controlledOpen,
  onClose,
  onApply,
  onReset,
  activeCount = 0,
  pendingCount,
  title,
  triggerLabel,
  triggerClassName = "",
}: FilterDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const t = useTranslations("filters");
  const tActions = useTranslations("actions");

  const { themed, flex } = THEME_CONSTANTS;

  // Controlled vs uncontrolled open state
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const drawerTitle =
    title ??
    (activeCount > 0 ? t("activeCount", { count: activeCount }) : t("title"));

  const handleApply = () => {
    onApply?.();
    if (!isControlled) setInternalOpen(false);
  };

  const handleReset = () => {
    onReset?.();
  };

  const footer = (
    <DrawerFormFooter
      onCancel={handleReset}
      onSubmit={handleApply}
      cancelLabel={t("resetAll")}
      submitLabel={
        pendingCount !== undefined && pendingCount > 0
          ? `${tActions("applyFilters")} (${pendingCount})`
          : tActions("applyFilters")
      }
    />
  );

  return (
    <>
      {/* Trigger button — only rendered in uncontrolled mode */}
      {!isControlled && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setInternalOpen(true)}
          aria-label={triggerLabel ?? t("title")}
          className={`inline-flex items-center gap-2 text-sm font-medium ${themed.textPrimary} rounded-lg border ${themed.border} p-2 px-3 hover:${themed.bgSecondary} transition-colors ${triggerClassName}`}
        >
          {/* Filter icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          {t("title")}
          {activeCount > 0 && (
            <Span
              className={`inline-${flex.center} w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
              aria-label={t("activeCount", { count: activeCount })}
            >
              {activeCount}
            </Span>
          )}
        </Button>
      )}

      {/* Drawer */}
      <SideDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={drawerTitle}
        side="left"
        mode="view"
        footer={footer}
      >
        <div className="divide-y divide-zinc-200 dark:divide-slate-700">
          {children}
        </div>
      </SideDrawer>
    </>
  );
}
