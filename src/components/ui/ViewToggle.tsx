"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components";

export type ViewMode = "grid" | "list";

export interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ACTIVE = "bg-primary/5 text-primary dark:bg-primary/10 ring-primary/30";
const INACTIVE =
  "text-zinc-500 dark:text-zinc-400 ring-zinc-200 dark:ring-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-800";

/**
 * ViewToggle — grid / list mode switcher.
 *
 * Designed to be passed to ListingLayout's `viewToggleSlot` for
 * non-DataTable views (ProductGrid, StoreCard grids, etc.).
 *
 * For DataTable-based views use `showViewToggle` + `viewMode` + `onViewModeChange`
 * directly on `<DataTable>`.
 *
 * @example
 * ```tsx
 * const viewMode = (table.get("view") || "grid") as "grid" | "list";
 * <ListingLayout
 *   viewToggleSlot={
 *     <ViewToggle value={viewMode} onChange={(m) => table.set("view", m)} />
 *   }
 * >
 *   <ProductGrid products={products} variant={viewMode} />
 * </ListingLayout>
 * ```
 */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const t = useTranslations("actions");

  return (
    <div className="flex gap-1" role="toolbar" aria-label="View mode">
      {/* Grid */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange("grid")}
        aria-label={t("gridView")}
        aria-pressed={value === "grid"}
        className={`flex items-center justify-center p-2 rounded-lg ring-1 transition-colors ${
          value === "grid" ? ACTIVE : INACTIVE
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      </Button>

      {/* List */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange("list")}
        aria-label={t("listView")}
        aria-pressed={value === "list"}
        className={`flex items-center justify-center p-2 rounded-lg ring-1 transition-colors ${
          value === "list" ? ACTIVE : INACTIVE
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </Button>
    </div>
  );
}
