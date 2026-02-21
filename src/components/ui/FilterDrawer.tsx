"use client";

import { ReactNode, useState } from "react";
import { SideDrawer } from "@/components";
import { DrawerFormFooter } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

interface FilterDrawerProps {
  /** FilterFacetSection nodes or any filter content */
  children: ReactNode;
  /** Called when the user clicks "Apply" */
  onApply?: () => void;
  /** Called when the user clicks "Clear all" */
  onClearAll?: () => void;
  /** Number of currently active filters - shows a badge on the trigger */
  activeCount?: number;
  /** Drawer heading. Defaults to UI_LABELS.FILTERS.TITLE */
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
 * button showing an active-filter badge, and footer "Clear all" / "Apply"
 * actions using DrawerFormFooter.
 *
 * @example
 * ```tsx
 * <FilterDrawer
 *   activeCount={activeFilters.length}
 *   onClearAll={clearAllFilters}
 *   onApply={applyFilters}
 * >
 *   <FilterFacetSection title="Category" options={...} selected={...} onChange={...} />
 *   <FilterFacetSection title="Status"   options={...} selected={...} onChange={...} />
 * </FilterDrawer>
 * ```
 */
export function FilterDrawer({
  children,
  onApply,
  onClearAll,
  activeCount = 0,
  title,
  triggerLabel,
  triggerClassName = "",
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { themed, borderRadius, spacing } = THEME_CONSTANTS;

  const drawerTitle =
    title ??
    (activeCount > 0
      ? UI_LABELS.FILTERS.ACTIVE_COUNT(activeCount)
      : UI_LABELS.FILTERS.TITLE);

  const handleApply = () => {
    onApply?.();
    setIsOpen(false);
  };

  const handleClearAll = () => {
    onClearAll?.();
  };

  const footer = (
    <DrawerFormFooter
      onCancel={handleClearAll}
      onSubmit={handleApply}
      cancelLabel={UI_LABELS.ACTIONS.CLEAR_ALL}
      submitLabel={UI_LABELS.ACTIONS.APPLY_FILTERS}
    />
  );

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={triggerLabel ?? UI_LABELS.FILTERS.TITLE}
        className={`inline-flex items-center gap-2 text-sm font-medium ${themed.textPrimary} ${borderRadius.lg} border ${themed.border} ${spacing.padding.xs} px-3 hover:${themed.bgSecondary} transition-colors ${triggerClassName}`}
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
        {UI_LABELS.FILTERS.TITLE}
        {activeCount > 0 && (
          <span
            className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
            aria-label={UI_LABELS.FILTERS.ACTIVE_COUNT(activeCount)}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={drawerTitle}
        side="left"
        mode="view"
        footer={footer}
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </div>
      </SideDrawer>
    </>
  );
}
