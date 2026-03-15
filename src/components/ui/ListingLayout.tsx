"use client";

/**
 * ListingLayout
 *
 * Standard layout shell for ALL listing / table pages — public, seller, admin,
 * and user. Matches the wireframe design:
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │ [headerSlot — AdminPageHeader / Heading + subtitle]             │
 *  ├──────────────────────────────────────────────────────────────────┤
 *  │ [statusTabsSlot — status filter tabs]                           │
 *  ├──────────────────────────────────────────────────────────────────┤
 *  │ STICKY ─────────────────────────────────────────────────────── │
 *  │ [Filters] [searchSlot] [viewToggle] [sortSlot] [acts] [page]   │
 *  ├──────────┬───────────────────────────────────────────────────────┤
 *  │ Filters  │  [activeFiltersSlot — chips]                         │
 *  │ (sidebar)│  [DataTable / ProductGrid / card list — children]    │
 *  └──────────┴───────────────────────────────────────────────────────┘
 *
 * Desktop: collapsible left filter sidebar.
 * Mobile: filter sidebar hidden; "Filters" button opens fullscreen overlay.
 * Apply filter on button click (not live) — matches wireframe.
 *
 * @example
 * ```tsx
 * <ListingLayout
 *   headerSlot={<AdminPageHeader title="Products" onAction={openCreate} />}
 *   filterContent={<FilterFacetSection ... />}
 *   filterActiveCount={2}
 *   onFilterApply={() => table.setPage(1)}
 *   onFilterClear={clearAll}
 *   searchSlot={<Search value={table.get('q')} onChange={v => table.set('q', v)} />}
 *   sortSlot={<SortDropdown ... />}
 *   activeFiltersSlot={<ActiveFilterChips ... />}
 *   paginationSlot={<TablePagination ... />}
 *   selectedCount={selectedIds.length}
 *   onClearSelection={() => setSelectedIds([])}
 *   bulkActionItems={[{ id: "delete", label: "Delete", variant: "danger", onClick: handleBulkDelete }]}
 * >
 *   <DataTable ... />
 * </ListingLayout>
 * ```
 */

import { ReactNode, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Aside, Button, BulkActionBar, Span, Text } from "@/components";
import type { BulkActionItem } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface ListingLayoutProps {
  // ── Header ──────────────────────────────────────────────────────────────
  /** Page header (AdminPageHeader, Heading, or custom) — rendered above toolbar */
  headerSlot?: ReactNode;

  // ── Status tabs ─────────────────────────────────────────────────────────
  /** Status filter tabs rendered between header and toolbar (orders, reviews) */
  statusTabsSlot?: ReactNode;

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

  // ── Active filters ──────────────────────────────────────────────────────
  /** ActiveFilterChips rendered above the content area */
  activeFiltersSlot?: ReactNode;

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
  /** Structured bulk action items — rendered in picker + Apply pattern */
  bulkActionItems?: BulkActionItem[];

  // ── Pagination ───────────────────────────────────────────────────────────
  /**
   * TablePagination rendered in the sticky toolbar (compact inline).
   * Pass `<TablePagination compact … />` here.
   */
  toolbarPaginationSlot?: ReactNode;
  /**
   * TablePagination rendered below the content area (full footer).
   * Used by all listing pages that want page controls at the bottom.
   */
  paginationSlot?: ReactNode;

  // ── Content ──────────────────────────────────────────────────────────────
  /** DataTable, card grid, or any other list content */
  children: ReactNode;

  // ── Options ──────────────────────────────────────────────────────────────
  /** Show the sidebar panel on desktop by default. Default: false */
  defaultSidebarOpen?: boolean;
  /** Additional className for the outer wrapper */
  className?: string;
  /** Loading state — shows skeleton placeholders */
  loading?: boolean;
  /** Error state node — rendered instead of children when present */
  errorSlot?: ReactNode;
}

export function ListingLayout({
  headerSlot,
  statusTabsSlot,
  filterContent,
  filterActiveCount = 0,
  onFilterApply,
  onFilterClear,
  filterTitle,
  activeFiltersSlot,
  searchSlot,
  sortSlot,
  viewToggleSlot,
  actionsSlot,
  selectedCount = 0,
  onClearSelection,
  bulkActionItems,
  toolbarPaginationSlot,
  paginationSlot,
  children,
  defaultSidebarOpen = false,
  className = "",
  loading = false,
  errorSlot,
}: ListingLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("filters");
  const tActions = useTranslations("actions");

  const { themed, flex, spacing } = THEME_CONSTANTS;

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
    <div className={`w-full ${spacing.stack} ${className}`}>
      {/* ─────────────────────── Header ─────────────────────── */}
      {headerSlot}

      {/* ─────────────────────── Status tabs ───────────────── */}
      {statusTabsSlot}

      {/* ─────────────────── Sticky toolbar header ──────────── */}
      <div
        className={[
          "sticky z-20 py-2",
          "top-20",
          THEME_CONSTANTS.layout.titleBarBg,
        ].join(" ")}
      >
        {/* Two-row layout on mobile; collapses to single row on sm+ */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* Row 1 on mobile / left group on sm+: filter trigger + search */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
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
                  className="lg:hidden flex-shrink-0 flex items-center gap-1.5"
                >
                  <FilterIcon />
                  {t("title")}
                  {filterActiveCount > 0 && (
                    <Span
                      className={`inline-${flex.center} w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
                      aria-label={t("activeCount", {
                        count: filterActiveCount,
                      })}
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
                  aria-label={sidebarOpen ? t("hideFilters") : t("showFilters")}
                  aria-expanded={sidebarOpen}
                  className="hidden lg:flex flex-shrink-0 items-center gap-1.5"
                >
                  <FilterIcon />
                  {t("title")}
                  {filterActiveCount > 0 && (
                    <Span
                      className={`inline-${flex.center} w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
                      aria-label={t("activeCount", {
                        count: filterActiveCount,
                      })}
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

            {/* Search — grows to fill remaining space */}
            {searchSlot && <div className="flex-1 min-w-0">{searchSlot}</div>}
          </div>

          {/* Row 2 on mobile / right group on sm+: sort · view toggle · actions · toolbar pagination */}
          <div className="flex items-center gap-2 flex-shrink-0 justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              {sortSlot}
              {viewToggleSlot}
              {actionsSlot}
            </div>
            {toolbarPaginationSlot}
          </div>
        </div>
      </div>

      {/* ─────────────── Sidebar + Content area ─────────────── */}
      <div className="flex gap-4 lg:gap-6 items-start">
        {/* Desktop filter sidebar */}
        {hasFilter && (
          <Aside
            aria-label={panelTitle}
            className={[
              "hidden lg:block flex-shrink-0 self-start",
              "sticky top-[8.5rem]",
              "transition-all duration-200 ease-in-out overflow-hidden",
              sidebarOpen
                ? "w-60 xl:w-64 2xl:w-72 opacity-100"
                : "w-0 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <div
              className={[
                "w-60 xl:w-64 2xl:w-72 border rounded-xl overflow-hidden",
                themed.border,
                themed.bgPrimary,
              ].join(" ")}
            >
              {/* Panel header */}
              <div
                className={`${flex.between} px-4 py-3 border-b ${themed.border} ${themed.bgSecondary}`}
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
                    className="text-xs text-primary hover:underline p-0 h-auto leading-none"
                  >
                    {tActions("clearAll")}
                  </Button>
                )}
              </div>

              {/* Scrollable facets */}
              <div
                className={`px-3 py-3 max-h-[calc(100vh-15rem)] overflow-y-auto ${spacing.stack}`}
              >
                {filterContent}
              </div>

              {/* Apply button at sidebar bottom — filters only apply on click */}
              <div className={`px-3 pb-3 pt-1 border-t ${themed.border}`}>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  size="sm"
                  onClick={onFilterApply}
                >
                  {tActions("applyFilters")}
                </Button>
              </div>
            </div>
          </Aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Bulk action bar — picker + apply (matches BottomActions) */}
          {selectedCount > 0 && (
            <BulkActionBar
              selectedCount={selectedCount}
              onClearSelection={onClearSelection}
              actions={bulkActionItems}
            />
          )}

          {/* Active filter chips */}
          {activeFiltersSlot}

          {/* Error state */}
          {errorSlot ? (
            errorSlot
          ) : (
            <>
              {children}
              {/* Full pagination footer — below content */}
              {paginationSlot && <div className="pt-2">{paginationSlot}</div>}
            </>
          )}
        </div>
      </div>

      {/* ─────────── Mobile fullscreen filter overlay ─────────── */}
      {hasFilter && mobileFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Fullscreen panel */}
          <div
            ref={mobileOverlayRef}
            className={[
              "fixed inset-0 z-50 flex flex-col lg:hidden",
              themed.bgPrimary,
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label={panelTitle}
          >
            {/* Header */}
            <div
              className={`${flex.between} px-4 py-3 border-b ${themed.border} flex-shrink-0`}
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
            <div
              className={`flex-1 overflow-y-auto px-4 py-4 ${spacing.stack}`}
            >
              {filterContent}
            </div>

            {/* Footer actions — apply filter button */}
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
