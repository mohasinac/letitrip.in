"use client";

/**
 * BulkActionBar
 *
 * A compact action bar that appears at the top of the content area whenever
 * one or more list items are selected. Matches the BottomActions bulk-mode
 * design: selection count pill (✕ to clear), type-picker dropdown, and an
 * Apply button.
 *
 * Rendered by ListingLayout automatically when selectedCount > 0.
 *
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={selectedIds.length}
 *   onClearSelection={() => setSelectedIds([])}
 *   actions={[
 *     { id: "cart",     label: t("bulkAddToCart"),     variant: "secondary", onClick: handleBulkAddToCart },
 *     { id: "wishlist", label: t("bulkAddToWishlist"), variant: "primary",   onClick: handleBulkAddToWishlist },
 *   ]}
 * />
 * ```
 */

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X, ChevronUp, ChevronDown, Check } from "lucide-react";
import { Button, Span } from "@/components";
import { useClickOutside } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";

export interface BulkActionItem {
  /** Stable unique key. */
  id: string;
  /** Visible label in the picker and on the trigger. */
  label: string;
  /** Button / text variant — influences Apply button colour. */
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "ghost"
    | "warning";
  /** Optional leading icon rendered in the picker row. */
  icon?: ReactNode;
  /** Called when the user clicks Apply with this action selected. */
  onClick: () => void;
  /** Disable this action. */
  disabled?: boolean;
  /** Show spinner on Apply when this action is selected. */
  loading?: boolean;
}

export interface BulkActionBarProps {
  /** Number of currently selected items */
  selectedCount: number;
  /** Called when the user clicks the ✕ deselect pill */
  onClearSelection?: () => void;
  /** Structured bulk action items — rendered as picker + Apply */
  actions?: BulkActionItem[];
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions = [],
}: BulkActionBarProps) {
  const t = useTranslations("listingLayout");
  const tActions = useTranslations("actions");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setPickerOpen(false));

  // Keep selectedActionId in sync with available actions
  useEffect(() => {
    setSelectedActionId((prev) => {
      const ids = actions.map((a) => a.id);
      if (prev && ids.includes(prev)) return prev;
      return ids[0] ?? null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions.map((a) => a.id).join(",")]);

  if (selectedCount === 0) return null;

  const selectedAction = actions.find((a) => a.id === selectedActionId);

  const handleApply = () => {
    if (!selectedActionId) return;
    selectedAction?.onClick();
    setPickerOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden border border-primary/20 dark:border-primary/30 animate-in fade-in slide-in-from-top-1 duration-150"
      role="region"
      aria-live="polite"
      aria-label={t("bulkActionsRegion")}
    >
      {/* ── Accent stripe ── */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 dark:from-secondary-600 dark:via-secondary-400 dark:to-secondary-600" />

      {/* ── Main row ── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Selection count pill — tap to clear */}
        <Button
          type="button"
          variant="ghost"
          onClick={onClearSelection}
          className="inline-flex items-center gap-1.5 flex-shrink-0 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 dark:bg-primary-950/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full pl-2 pr-3 h-8 border border-primary-200/70 dark:border-primary-800/50 transition-colors min-h-0"
          aria-label={tActions("clearSelection")}
        >
          <X className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <Span className="text-xs font-semibold tabular-nums whitespace-nowrap leading-none">
            {t("selectedCount", { count: selectedCount })}
          </Span>
        </Button>

        {/* Picker trigger — flex-1 */}
        {actions.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPickerOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            className={[
              "flex-1 min-w-0 h-10 flex items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors",
              "bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60",
              "border-zinc-200 dark:border-slate-700",
              selectedAction?.variant === "danger"
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-800 dark:text-zinc-100",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {selectedAction?.icon && (
              <Span
                className={`flex-shrink-0 w-4 h-4 ${THEME_CONSTANTS.flex.center}`}
                aria-hidden="true"
              >
                {selectedAction.icon}
              </Span>
            )}
            <Span className="flex-1 truncate text-left leading-none">
              {selectedAction?.label ?? t("bulkActionsRegion")}
            </Span>
            {pickerOpen ? (
              <ChevronUp
                className="w-4 h-4 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
            ) : (
              <ChevronDown
                className="w-4 h-4 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
            )}
          </Button>
        )}

        {/* Apply button */}
        {actions.length > 0 && (
          <Button
            type="button"
            variant={selectedAction?.variant ?? "primary"}
            size="sm"
            isLoading={selectedAction?.loading}
            disabled={
              !selectedActionId ||
              selectedAction?.disabled ||
              selectedAction?.loading
            }
            onClick={handleApply}
            className="h-10 flex-shrink-0"
          >
            <Span className="leading-none">{t("apply")}</Span>
          </Button>
        )}
      </div>

      {/* ── Picker dropdown (opens downward) ── */}
      {actions.length > 0 && (
        <div
          role="listbox"
          aria-label={t("bulkActionsRegion")}
          className={[
            "overflow-hidden border-t border-zinc-200/80 dark:border-slate-700/80",
            "transition-[max-height,opacity] duration-200 ease-out",
            pickerOpen
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {actions.map((action, i) => {
            const isSelected = action.id === selectedActionId;
            return (
              <Button
                key={action.id}
                role="option"
                aria-selected={isSelected}
                type="button"
                variant="ghost"
                disabled={action.disabled || action.loading}
                onClick={() => {
                  setSelectedActionId(action.id);
                  setPickerOpen(false);
                }}
                className={[
                  "w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors rounded-none",
                  i > 0
                    ? "border-t border-zinc-100/80 dark:border-slate-800/80"
                    : "",
                  isSelected ? "bg-zinc-50 dark:bg-slate-800/60" : "",
                  action.variant === "danger"
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    : "text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-slate-800/60",
                  action.disabled || action.loading
                    ? "opacity-50 cursor-not-allowed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {action.icon && (
                  <Span
                    className={`flex-shrink-0 w-5 h-5 ${THEME_CONSTANTS.flex.center}`}
                    aria-hidden="true"
                  >
                    {action.icon}
                  </Span>
                )}
                <Span className="flex-1 truncate">{action.label}</Span>
                {isSelected && (
                  <Check
                    className="w-4 h-4 flex-shrink-0 text-primary-600 dark:text-primary-400"
                    aria-hidden="true"
                  />
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
