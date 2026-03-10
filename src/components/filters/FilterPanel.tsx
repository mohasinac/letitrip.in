"use client";

import { FilterFacetSection } from "@/components";
import { RangeFilter } from "./RangeFilter";
import { SwitchFilter } from "./SwitchFilter";
import type { UrlTable, FacetOption } from "./ProductFilters";

// ─── Config discriminated union ──────────────────────────────────────────────

export interface FacetSingleConfig {
  type: "facet-single";
  /** URL param key (a single value: `?key=value`) */
  key: string;
  title: string;
  options: FacetOption[];
  defaultCollapsed?: boolean;
  searchable?: boolean;
}

export interface FacetMultiConfig {
  type: "facet-multi";
  /** URL param key (pipe-separated: `?key=a|b|c`) */
  key: string;
  title: string;
  options: FacetOption[];
  defaultCollapsed?: boolean;
  searchable?: boolean;
}

export interface SwitchConfig {
  type: "switch";
  /** URL param key (stored as "true" or "") */
  key: string;
  title: string;
  /** Descriptive label next to the toggle */
  label: string;
  defaultCollapsed?: boolean;
}

export interface RangeNumberConfig {
  type: "range-number";
  /** URL param key for the minimum bound */
  minKey: string;
  /** URL param key for the maximum bound */
  maxKey: string;
  title: string;
  prefix?: string;
  showSlider?: boolean;
  minBound?: number;
  maxBound?: number;
  step?: number;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  defaultCollapsed?: boolean;
}

export interface RangeDateConfig {
  type: "range-date";
  /** URL param key for the start date */
  fromKey: string;
  /** URL param key for the end date */
  toKey: string;
  title: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  defaultCollapsed?: boolean;
}

export type FilterConfig =
  | FacetSingleConfig
  | FacetMultiConfig
  | SwitchConfig
  | RangeNumberConfig
  | RangeDateConfig;

// ─── Component ────────────────────────────────────────────────────────────────

export interface FilterPanelProps {
  /** Ordered list of filter sections to render */
  config: FilterConfig[];
  /** UrlTable handle from useUrlTable */
  table: UrlTable;
}

/**
 * FilterPanel — config-driven filter sidebar.
 *
 * Renders a vertical stack of filter sections based on a `config` array.
 * Each section maps to one of: `FilterFacetSection` (single or multi-select),
 * `SwitchFilter` (boolean toggle), `RangeFilter` (number or date range).
 *
 * All URL read/write is delegated to the `table` handle so the parent controls
 * the URL param names.
 *
 * @example
 * ```tsx
 * const config: FilterConfig[] = [
 *   { type: "facet-multi", key: "status", title: t("status"), options: statusOpts },
 *   { type: "switch", key: "isWinning", title: t("isWinning"), label: t("showWinningOnly") },
 *   { type: "range-number", minKey: "minAmount", maxKey: "maxAmount", title: t("amountRange"), prefix: "₹", showSlider: true, minBound: 0, maxBound: 1000000, step: 1000 },
 * ];
 * return <FilterPanel config={config} table={table} />;
 * ```
 */
export function FilterPanel({ config, table }: FilterPanelProps) {
  return (
    <div>
      {config.map((section, i) => {
        if (section.type === "facet-single") {
          const val = table.get(section.key);
          return (
            <FilterFacetSection
              key={i}
              title={section.title}
              options={section.options}
              selected={val ? [val] : []}
              onChange={(vals) => table.set(section.key, vals[0] ?? "")}
              searchable={section.searchable ?? false}
              defaultCollapsed={section.defaultCollapsed ?? true}
              selectionMode="single"
            />
          );
        }

        if (section.type === "facet-multi") {
          const val = table.get(section.key);
          return (
            <FilterFacetSection
              key={i}
              title={section.title}
              options={section.options}
              selected={val ? val.split("|").filter(Boolean) : []}
              onChange={(vals) => table.set(section.key, vals.join("|"))}
              searchable={section.searchable ?? false}
              defaultCollapsed={section.defaultCollapsed ?? true}
            />
          );
        }

        if (section.type === "switch") {
          return (
            <SwitchFilter
              key={i}
              title={section.title}
              label={section.label}
              checked={table.get(section.key) === "true"}
              onChange={(v) => table.set(section.key, v ? "true" : "")}
              defaultCollapsed={section.defaultCollapsed ?? true}
            />
          );
        }

        if (section.type === "range-number") {
          return (
            <RangeFilter
              key={i}
              title={section.title}
              type="number"
              minValue={table.get(section.minKey)}
              maxValue={table.get(section.maxKey)}
              onMinChange={(v) => table.set(section.minKey, v)}
              onMaxChange={(v) => table.set(section.maxKey, v)}
              prefix={section.prefix}
              showSlider={section.showSlider}
              minBound={section.minBound}
              maxBound={section.maxBound}
              step={section.step}
              minPlaceholder={section.minPlaceholder}
              maxPlaceholder={section.maxPlaceholder}
              defaultCollapsed={section.defaultCollapsed ?? true}
            />
          );
        }

        if (section.type === "range-date") {
          return (
            <RangeFilter
              key={i}
              title={section.title}
              type="date"
              minValue={table.get(section.fromKey)}
              maxValue={table.get(section.toKey)}
              onMinChange={(v) => table.set(section.fromKey, v)}
              onMaxChange={(v) => table.set(section.toKey, v)}
              minPlaceholder={section.minPlaceholder}
              maxPlaceholder={section.maxPlaceholder}
              defaultCollapsed={section.defaultCollapsed ?? true}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
