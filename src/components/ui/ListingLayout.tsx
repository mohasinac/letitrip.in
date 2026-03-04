"use client";

/**
 * ListingLayout
 *
 * Standard layout shell for ALL listing / table pages — public, seller, and
 * admin.  Provides a collapsible filter sidebar on desktop and a fullscreen
 * filter overlay on mobile, along with toolbar slots for search, view-toggle,
 * sort, and right-side action buttons.
 *
 * Bulk-action bar appears automatically when selectedCount > 0.
 *
 * Mobile behaviour
 * ────────────────
 * • Filter panel is hidden.  A "Filters" trigger button opens a fullscreen
 *   overlay.  "Apply" or tapping the backdrop closes it.
 * • On mobile the Apply button fires onFilterApply, then closes the overlay.
 *
 * Desktop behaviour
 * ─────────────────
 * • Filter panel renders as an inline left-side sidebar.
 * • A toggle button in the toolbar collapses / expands it with a CSS slide.
 * • "Clear all" is always reachable inside the sidebar header.
 *
 * @example
 * ```tsx
 * const table = useUrlTable({ defaults: { pageSize: '24', sorts: '-createdAt' } });
 *
 * <ListingLayout
 *   filterContent={<FilterFacetSection title="Category" options={...} selected={...} onChange={...} />}
 *   filterActiveCount={activeFilterCount}
 *   onFilterApply={() => table.setPage(1)}
 *   onFilterClear={clearAllFilters}
 *   searchSlot={<Search value={table.get('q')} onChange={v => table.set('q', v)} />}
 *   sortSlot={<SortDropdown value={table.get('sorts')} onChange={v => table.setSort(v)} options={SORT_OPTIONS} />}
 *   viewToggleSlot={...}
 *   actionsSlot={<Button variant="primary" onClick={openCreate}>Create</Button>}
 *   selectedCount={selectedIds.length}
 *   onClearSelection={() => setSelectedIds([])}
 *   bulkActions={<>
 *     <Button variant="danger" size="sm" onClick={bulkDelete}>Delete</Button>
 *   </>}
 * >
 *   <DataTable ... />
 * </ListingLayout>
 * ```
 */

import { ReactNode, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button, BulkActionBar, Span, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface ListingLayoutProps {
  // ── Filter ──────────────────────────────────────────────────────────────
  /** FilterFacetSection nodes rendered in the filter panel */
  filterContent?: ReactNode;
  /** Number of currently active filters — drives badge and "Clear all" */
  filterActiveCount?: number;
  /** Called when mobile overlay "Apply" is tapped and closes */
  onFilterApply?: () => void;
  /** Called when "Clear all" is clicked */
  onFilterClear?: () => void;
  /** Filter panel title. Defaults to the "filters.title" i18n key */
  filterTitle?: string;

  // ── Toolbar slots ────────────────────────────────────────────────────────
  /** <Search> component */
  searchSlot?: ReactNode;
  /** <SortDropdown> component */
  sortSlot?: ReactNode;
  /** View-mode toggle buttons (grid / list / table) */
  viewToggleSlot?: ReactNode;
  /** Right-side action buttons (e.g. "Create", "Export") */
  actionsSlot?: ReactNode;

  // ── Bulk selection ───────────────────────────────────────────────────────
  /** Number of selected items — BulkActionBar is shown when this is > 0 */
  selectedCount?: number;
  /** Called when user clicks the ✕ in the BulkActionBar */
  onClearSelection?: () => void;
  /** Action buttons rendered inside the BulkActionBar */
  bulkActions?: ReactNode;

  // ── Content ──────────────────────────────────────────────────────────────
  /** DataTable, card grid, or any other list content */
  children: ReactNode;

  // ── Options ──────────────────────────────────────────────────────────────
  /** Show the sidebar panel on desktop by default. Default: true */
  defaultSidebarOpen?: boolean;
  /** Additional className for the outer wrapper */
  className?: string;
}

export function ListingLayout({
  filterContent,
  filterActiveCount = 0,
  onFilterApply,
  onFilterClear,
  filterTitle,
  searchSlot,
  sortSlot,
  viewToggleSlot,
  actionsSlot,
  selectedCount = 0,
  onClearSelection,
  bulkActions,
  children,
  defaultSidebarOpen = true,
  className = "",
}: ListingLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("filters");
  const tActions = useTranslations("actions");

  const { themed, borderRadius, flex } = THEME_CONSTANTS;

  const hasFilter = Boolean(filterContent);
  const panelTitle = filterTitle ?? t("title");

  // Close mobile overlay on Escape key
  useEffect(() => {
    if (!mobileFilterOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFilterOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [mobileFilterOpen]);

  // Lock body scroll while mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      const w = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${w}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [mobileFilterOpen]);

  const handleMobileApply = () => {
    onFilterApply?.();
    setMobileFilterOpen(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ─────────────────────── Toolbar ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
        {/* Filter trigger */}
        {hasFilter && (
          <>
            {/* Mobile: opens fullscreen overlay */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              aria-label={t("title")}
              className="md:hidden flex items-center gap-1.5"
            >
              <FilterIcon />
              {t("title")}
              {filterActiveCount > 0 && (
                <Span
                  className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
                  aria-label={t("activeCount", { count: filterActiveCount })}
                >
                  {filterActiveCount}
                </Span>
              )}
            </Button>

            {/* Desktop: collapses/expands the sidebar */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={
                sidebarOpen ? t("hideFilters") : t("showFilters")
              }
              aria-expanded={sidebarOpen}
              className="hidden md:flex items-center gap-1.5"
            >
              <FilterIcon />
              {t("title")}
              {filterActiveCount > 0 && (
                <Span
                  className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
                  aria-label={t("activeCount", { count: filterActiveCount })}
                >
                  {filterActiveCount}
                </Span>
              )}
              {/* Chevron */}
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </>
        )}

        {/* Search — grows to fill available space */}
        {searchSlot && (
          <div className="flex-1 min-w-[180px]">{searchSlot}</div>
        )}

        {/* Right-side controls */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {viewToggleSlot}
          {sortSlot}
          {actionsSlot}
        </div>
      </div>

      {/* ─────────────── Sidebar + Content area ─────────────── */}
      <div className="flex gap-4 lg:gap-6 items-start">
        {/* Desktop filter sidebar */}
        {hasFilter && (
          <aside
            aria-label={panelTitle}
            className={[
              "hidden md:block flex-shrink-0",
              "transition-all duration-200 ease-in-out overflow-hidden",
              sidebarOpen
                ? "w-60 xl:w-64 opacity-100"
                : "w-0 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <div
              className={[
                "w-60 xl:w-64 border rounded-xl overflow-hidden",
                themed.border,
                themed.bgPrimary,
              ].join(" ")}
            >
              {/* Panel header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b ${themed.border} ${themed.bgSecondary}`}
              >
                <Text weight="semibold" size="sm">
                  {panelTitle}
                </Text>
                {filterActiveCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFilterClear}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline p-0 h-auto leading-none"
                  >
                    {tActions("clearAll")}
                  </Button>
                )}
              </div>

              {/* Scrollable facets */}
              <div className="px-3 py-3 max-h-[calc(100vh-220px)] overflow-y-auto">
                {filterContent}
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Bulk action bar (appears when items are selected) */}
          {selectedCount > 0 && (
            <BulkActionBar
              selectedCount={selectedCount}
              onClearSelection={onClearSelection}
            >
              {bulkActions}
            </BulkActionBar>
          )}

          {children}
        </div>
      </div>

      {/* ─────────── Mobile fullscreen filter overlay ─────────── */}
      {hasFilter && mobileFilterOpen && (
        <>
          {/* Backdrop (for wide tablets that could show partial drawer) */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Fullscreen panel */}
          <div
            ref={mobileOverlayRef}
            className={[
              "fixed inset-0 z-50 flex flex-col md:hidden",
              themed.bgPrimary,
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label={panelTitle}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-b ${themed.border} flex-shrink-0`}
            >
              <Text weight="semibold">
                {panelTitle}
                {filterActiveCount > 0 && ` (${filterActiveCount})`}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMobileFilterOpen(false)}
                aria-label={tActions("close")}
                className="-mr-1 p-2"
              >
                <svg
                  className="w-5 h-5"
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
            </div>

            {/* Scrollable facets */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {filterContent}
            </div>

            {/* Footer actions */}
            <div
              className={[
                "flex-shrink-0 flex gap-3 px-4 py-3 border-t",
                themed.border,
                themed.bgSecondary,
              ].join(" ")}
            >
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onFilterClear?.();
                }}
              >
                {tActions("clearAll")}
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={handleMobileApply}
              >
                {tActions("applyFilters")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
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
  );
}
