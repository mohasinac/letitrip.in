"use client";

import { useTranslations } from "next-intl";
import {
  ViewToggle as BaseViewToggle,
  type ViewMode,
  type ViewToggleProps as BaseViewToggleProps,
} from "@mohasinac/ui";

export type { ViewMode };

export interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

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
    <BaseViewToggle
      value={value}
      onChange={onChange as BaseViewToggleProps["onChange"]}
      labels={{
        grid: t("gridView"),
        list: t("listView"),
        toolbar: "View mode",
      }}
    />
  );
}
