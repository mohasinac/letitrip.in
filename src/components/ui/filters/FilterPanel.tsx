/**
 * FilterPanel - Advanced filtering component with multiple filter types
 *
 * @example
 * <FilterPanel
 *   filters={[
 *     { type: "select", name: "status", label: "Status", options: statusOptions },
 *     { type: "dateRange", name: "dateRange", label: "Date Range" },
 *   ]}
 *   onApply={handleApply}
 *   onReset={handleReset}
 * />
 */

"use client";

import React, { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";

export type FilterType =
  | "text"
  | "select"
  | "multiSelect"
  | "dateRange"
  | "numberRange"
  | "boolean"
  | "date";

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterConfig {
  /** Filter type */
  type: FilterType;
  /** Filter name/key */
  name: string;
  /** Display label */
  label: string;
  /** Current value */
  value?: any;
  /** Options for select/multiSelect */
  options?: FilterOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Min value for number/date range */
  min?: number | string;
  /** Max value for number/date range */
  max?: number | string;
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface FilterPreset {
  /** Preset name */
  name: string;
  /** Preset icon */
  icon?: React.ReactNode;
  /** Filter values */
  filters: Record<string, any>;
}

export interface FilterPanelProps {
  /** Array of filter configurations */
  filters: FilterConfig[];
  /** Apply filters handler */
  onApply: (filters: Record<string, any>) => void;
  /** Reset filters handler */
  onReset: () => void;
  /** Change handler for individual filters */
  onChange?: (name: string, value: any) => void;
  /** Collapsible panel */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Show active filter count badge */
  showActiveCount?: boolean;
  /** Filter presets */
  presets?: FilterPreset[];
  /** Apply preset handler */
  onApplyPreset?: (preset: FilterPreset) => void;
  /** Save current filters as preset */
  onSavePreset?: (name: string) => void;
  /** Layout style */
  layout?: "inline" | "stacked";
  /** Additional CSS classes */
  className?: string;
}

export const FilterPanel = React.forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      filters,
      onApply,
      onReset,
      onChange,
      collapsible = false,
      defaultCollapsed = false,
      showActiveCount = true,
      presets,
      onApplyPreset,
      onSavePreset,
      layout = "inline",
      className,
      ...props
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [localFilters, setLocalFilters] = useState<Record<string, any>>(
      filters.reduce((acc, filter) => {
        acc[filter.name] = filter.value || "";
        return acc;
      }, {} as Record<string, any>)
    );
    const [showPresetDialog, setShowPresetDialog] = useState(false);
    const [presetName, setPresetName] = useState("");

    // Count active filters
    const activeFilterCount = filters.filter((f) => {
      const value = localFilters[f.name];
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== null && value !== undefined;
    }).length;

    const handleFilterChange = (name: string, value: any) => {
      const newFilters = { ...localFilters, [name]: value };
      setLocalFilters(newFilters);
      onChange?.(name, value);
    };

    const handleApply = () => {
      onApply(localFilters);
    };

    const handleReset = () => {
      const resetFilters = filters.reduce((acc, filter) => {
        acc[filter.name] = "";
        return acc;
      }, {} as Record<string, any>);
      setLocalFilters(resetFilters);
      onReset();
    };

    const handleClearFilter = (name: string) => {
      handleFilterChange(name, "");
    };

    const handleApplyPreset = (preset: FilterPreset) => {
      setLocalFilters(preset.filters);
      onApplyPreset?.(preset);
    };

    const handleSavePreset = () => {
      if (presetName.trim()) {
        onSavePreset?.(presetName);
        setPresetName("");
        setShowPresetDialog(false);
      }
    };

    const renderFilter = (filter: FilterConfig) => {
      const value = localFilters[filter.name];

      switch (filter.type) {
        case "text":
          return (
            <input
              type="text"
              value={value || ""}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              placeholder={filter.placeholder}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          );

        case "select":
          return (
            <select
              value={value || ""}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{filter.placeholder || "Select..."}</option>
              {filter.options?.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "multiSelect":
          return (
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleFilterChange(filter.name, selected);
              }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            >
              {filter.options?.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "date":
          return (
            <input
              type="date"
              value={value || ""}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          );

        case "dateRange":
          return (
            <div className="flex gap-2">
              <input
                type="date"
                value={value?.start || ""}
                onChange={(e) =>
                  handleFilterChange(filter.name, {
                    ...value,
                    start: e.target.value,
                  })
                }
                placeholder="Start"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={value?.end || ""}
                onChange={(e) =>
                  handleFilterChange(filter.name, {
                    ...value,
                    end: e.target.value,
                  })
                }
                placeholder="End"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          );

        case "numberRange":
          return (
            <div className="flex gap-2">
              <input
                type="number"
                value={value?.min || ""}
                onChange={(e) =>
                  handleFilterChange(filter.name, {
                    ...value,
                    min: e.target.value,
                  })
                }
                placeholder="Min"
                min={filter.min}
                max={filter.max}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                value={value?.max || ""}
                onChange={(e) =>
                  handleFilterChange(filter.name, {
                    ...value,
                    max: e.target.value,
                  })
                }
                placeholder="Max"
                min={filter.min}
                max={filter.max}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          );

        case "boolean":
          return (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) =>
                  handleFilterChange(filter.name, e.target.checked)
                }
                className="w-4 h-4 border border-border rounded text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-text">{filter.label}</span>
            </label>
          );

        default:
          return null;
      }
    };

    return (
      <UnifiedCard
        ref={ref}
        variant="default"
        className={cn("mb-6", className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text">Filters</h3>
            {showActiveCount && activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSavePreset && activeFilterCount > 0 && (
              <UnifiedButton
                variant="ghost"
                size="sm"
                onClick={() => setShowPresetDialog(true)}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </UnifiedButton>
            )}
            {collapsible && (
              <UnifiedButton
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </UnifiedButton>
            )}
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Presets */}
            {presets && presets.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-textSecondary mb-2">
                  Quick Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, index) => (
                    <UnifiedButton
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {preset.icon && (
                        <span className="mr-1">
                          {React.cloneElement(
                            preset.icon as React.ReactElement,
                            {
                              className: "w-3 h-3",
                            }
                          )}
                        </span>
                      )}
                      {preset.name}
                    </UnifiedButton>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Fields */}
            <div
              className={cn(
                "grid gap-4",
                layout === "inline"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filters.map((filter) => (
                <div
                  key={filter.name}
                  className={cn(
                    "space-y-2",
                    filter.hideOnMobile && "hidden md:block"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-text">
                      {filter.label}
                    </label>
                    {localFilters[filter.name] && (
                      <button
                        onClick={() => handleClearFilter(filter.name)}
                        className="text-xs text-textSecondary hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {renderFilter(filter)}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-4 border-t border-border">
              <UnifiedButton
                variant="outline"
                onClick={handleReset}
                disabled={activeFilterCount === 0}
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </UnifiedButton>
              <UnifiedButton onClick={handleApply}>
                <Filter className="w-4 h-4 mr-1" />
                Apply Filters
              </UnifiedButton>
            </div>
          </>
        )}

        {/* Save Preset Dialog */}
        {showPresetDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg border border-border max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <UnifiedButton
                  variant="outline"
                  onClick={() => {
                    setShowPresetDialog(false);
                    setPresetName("");
                  }}
                >
                  Cancel
                </UnifiedButton>
                <UnifiedButton onClick={handleSavePreset}>
                  Save Preset
                </UnifiedButton>
              </div>
            </div>
          </div>
        )}
      </UnifiedCard>
    );
  }
);

FilterPanel.displayName = "FilterPanel";
