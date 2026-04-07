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
import { usePathname } from "@/i18n/navigation";
import { Aside, Button, BulkActionBar, Span, Text } from "@/components";
import type { BulkActionItem } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useBottomActions } from "@/hooks";
import type { BottomAction } from "@/contexts/BottomActionsContext";

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

  // Dashboard layouts (admin / seller) scroll inside an overflow-y-auto container.
  // Sticky offsets are relative to that scroll container so top-0 is correct.
  // Public pages have a sticky TitleBar+Navbar above, requiring top-14/top-[120px].
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/admin") || pathname.startsWith("/seller");

  // Register bulk actions with the mobile BottomActions bar (md:hidden sticky bar).
  // Feature components that already call useBottomActions for bulk will
  // overwrite this registration (parent effects run after child effects in React).
  useBottomActions({
    bulk:
      selectedCount > 0 && bulkActionItems && bulkActionItems.length > 0
        ? {
            selectedCount,
            onClearSelection: onClearSelection ?? (() => {}),
            actions: bulkActionItems as BottomAction[],
          }
        : undefined,
  });

  const { spacing } = THEME_CONSTANTS;

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
    <div
      className={[
        "w-full",
        spacing.stack,
        // On mobile the pagination sits in a fixed bar (h-10). Add bottom
        // padding so the last row of the table/grid is never hidden behind it.
        // When bulk actions are active the BottomActions bar also occupies
        // bottom-14 → bump padding up to pb-28 so it clears both bars.
        toolbarPaginationSlot
          ? selectedCount > 0
            ? "pb-28 md:pb-0"
            : "pb-12 md:pb-0"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ─────────────────────── Header ─────────────────────── */}
      {headerSlot}

      {/* ─────────────────────── Status tabs ───────────────── */}
      {statusTabsSlot && (
        <div
          className={[
            "overflow-x-auto touch-pan-x -mx-4 px-4 md:-mx-6 md:px-6",
            THEME_CONSTANTS.utilities.scrollbarThinX,
          ].join(" ")}
        >
          {statusTabsSlot}
        </div>
      )}

      {/* ─────────────────── Sticky toolbar ─────────────── */}
      <div
        className={[
          "sticky z-20 -mx-4 px-4 md:-mx-6 md:px-6",
          isDashboard ? "top-0" : "top-14 md:top-[120px]",
          // Frosted glass bar
          "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md",
          "border-b border-zinc-200/70 dark:border-slate-800/70",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
          "py-2.5",
        ].join(" ")}
      >
        {/* ── Desktop (md+): single flex row ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 min-w-0">
          {/* Filter sidebar toggle — visible at lg+ (sidebar appears at lg) */}
          {hasFilter && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? t("hideFilters") : t("showFilters")}
              aria-expanded={sidebarOpen}
              className={[
                "hidden lg:flex flex-shrink-0 items-center gap-1.5",
                "rounded-full h-8 px-3 text-sm font-medium",
                "border transition-all duration-150",
                sidebarOpen
                  ? "bg-primary/10 border-primary/30 text-primary dark:bg-primary/15 dark:border-primary/40"
                  : "border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-slate-300 hover:border-zinc-300 dark:hover:border-slate-600 hover:bg-zinc-50 dark:hover:bg-slate-800/60",
              ].join(" ")}
            >
              <FilterIcon />
              {t("title")}
              {filterActiveCount > 0 && (
                <Span
                  className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-primary text-white"
                  aria-label={t("activeCount", { count: filterActiveCount })}
                >
                  {filterActiveCount}
                </Span>
              )}
            </Button>
          )}

          {/* Search — grows to fill available space */}
          {searchSlot && <div className="flex-1 min-w-0">{searchSlot}</div>}

          {/* Sort + view + actions — shrink-0 so they never compress */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {sortSlot}
            {viewToggleSlot && (
              <div className="flex items-center gap-0.5 rounded-full border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-sm">
                {viewToggleSlot}
              </div>
            )}
            {actionsSlot}
          </div>

          {/* Pagination — pushed to far right with a faint separator */}
          {toolbarPaginationSlot && (
            <div className="ml-auto flex-shrink-0 pl-3 border-l border-zinc-200/70 dark:border-slate-700/70">
              {toolbarPaginationSlot}
            </div>
          )}
        </div>

        {/* ── Mobile (< md): two stacked rows ────────────────────────────── */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Row 1: filter trigger + search */}
          <div className="flex items-center gap-2">
            {hasFilter && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMobileFilterOpen(true)}
                aria-label={t("title")}
                className={[
                  "flex-shrink-0 flex items-center gap-1.5",
                  "rounded-full h-9 px-3 text-sm font-medium",
                  "border border-zinc-200 dark:border-slate-700",
                  "text-zinc-600 dark:text-slate-300",
                  "hover:bg-zinc-50 dark:hover:bg-slate-800/60 transition-colors",
                  filterActiveCount > 0
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "",
                ].join(" ")}
              >
                <FilterIcon />
                {t("title")}
                {filterActiveCount > 0 && (
                  <Span
                    className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-primary text-white"
                    aria-label={t("activeCount", { count: filterActiveCount })}
                  >
                    {filterActiveCount}
                  </Span>
                )}
              </Button>
            )}
            {searchSlot && <div className="flex-1 min-w-0">{searchSlot}</div>}
          </div>

          {/* Row 2: sort + view + actions — scrollable so nothing squishes */}
          {(sortSlot || viewToggleSlot || actionsSlot) && (
            <div
              className={[
                "flex items-stretch min-h-[44px] gap-2 overflow-x-auto",
                THEME_CONSTANTS.utilities.scrollbarThinX,
              ].join(" ")}
            >
              <div className="flex items-center gap-2 flex-shrink-0 pb-px">
                {sortSlot}
                {viewToggleSlot}
                {actionsSlot}
              </div>
            </div>
          )}
        </div>

        {/* ── Bulk action bar — sticky inside toolbar on desktop ──────────── */}
        {/* Mobile bulk actions are handled by useBottomActions → BottomActions bar */}
        {selectedCount > 0 && (
          <div className="hidden md:block pt-2 mt-2 border-t border-zinc-100 dark:border-slate-800">
            <BulkActionBar
              selectedCount={selectedCount}
              onClearSelection={onClearSelection}
              actions={bulkActionItems}
            />
          </div>
        )}
      </div>

      {/* ─────────────── Sidebar + Content area ─────────────── */}
      <div className="flex gap-4 lg:gap-6 items-start">
        {/* Desktop filter sidebar */}
        {hasFilter && (
          <Aside
            aria-label={panelTitle}
            className={[
              "hidden lg:block flex-shrink-0 self-start",
              isDashboard ? "sticky top-16" : "sticky top-[176px]",
              "transition-all duration-200 ease-in-out overflow-hidden",
              sidebarOpen
                ? "w-60 xl:w-64 2xl:w-72 opacity-100"
                : "w-0 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <div
              className={[
                "w-60 xl:w-64 2xl:w-72 rounded-2xl overflow-hidden",
                "border border-zinc-200/80 dark:border-slate-700/60",
                "bg-white dark:bg-slate-900",
                "shadow-sm",
              ].join(" ")}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-slate-800">
                <Text weight="semibold" size="sm">
                  {panelTitle}
                </Text>
                {filterActiveCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFilterClear}
                    className="text-xs text-primary hover:text-primary/80 hover:underline p-0 h-auto leading-none font-medium"
                  >
                    {tActions("clearAll")}
                  </Button>
                )}
              </div>

              {/* Scrollable facets */}
              <div
                className={`px-3 pt-5 pb-3 max-h-[calc(100vh-15rem)] overflow-y-auto ${spacing.stack}`}
              >
                {filterContent}
              </div>

              {/* Apply button at sidebar bottom — filters only apply on click */}
              <div className="px-3 pb-3 pt-2 border-t border-zinc-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full rounded-xl"
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

      {/* ─────────── Mobile sticky pagination bar ─────────── */}
      {/* Sits at bottom-14 normally (above BottomNavbar). When bulk mode is
          active (selectedCount > 0) the BottomActions bar occupies bottom-14,
          so we shift up to bottom-28 to stay visible above it. */}
      {toolbarPaginationSlot && (
        <nav
          aria-label="Pagination"
          className={[
            "fixed left-0 right-0 md:hidden",
            isDashboard
              ? "bottom-0"
              : selectedCount > 0
                ? "bottom-28"
                : "bottom-14",
            "z-[39]",
            THEME_CONSTANTS.layout.bottomNavBg,
            "shadow-[0_-2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.20)]",
            "h-10 flex items-center justify-center px-3 overflow-x-auto pb-px",
            THEME_CONSTANTS.utilities.scrollbarThinX,
          ].join(" ")}
        >
          {toolbarPaginationSlot}
        </nav>
      )}

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
              "bg-white dark:bg-slate-950",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label={panelTitle}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-slate-800 flex-shrink-0">
              <Text weight="semibold">
                {panelTitle}
                {filterActiveCount > 0 && (
                  <Span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-primary text-white">
                    {filterActiveCount}
                  </Span>
                )}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMobileFilterOpen(false)}
                aria-label={tActions("close")}
                className="rounded-full w-8 h-8 p-0 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-slate-800"
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
            </div>

            {/* Scrollable facets */}
            <div
              className={`flex-1 overflow-y-auto px-4 pt-6 pb-4 ${spacing.stack}`}
            >
              {filterContent}
            </div>

            {/* Footer actions — apply filter button */}
            <div className="flex-shrink-0 flex gap-3 px-4 py-4 border-t border-zinc-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl"
                onClick={() => {
                  onFilterClear?.();
                }}
              >
                {tActions("clearAll")}
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 rounded-xl"
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
