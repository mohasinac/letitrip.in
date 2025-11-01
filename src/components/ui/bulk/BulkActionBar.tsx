/**
 * BulkActionBar - Floating action bar for bulk operations with multi-select
 *
 * @example
 * <BulkActionBar
 *   selectedCount={selectedItems.length}
 *   actions={[
 *     { label: "Delete", icon: <Trash />, onClick: handleBulkDelete },
 *     { label: "Export", icon: <Download />, onClick: handleBulkExport },
 *   ]}
 *   onClear={clearSelection}
 * />
 */

"use client";

import React, { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedButton } from "@/components/ui/unified/Button";

export interface BulkAction {
  /** Action label */
  label: string;
  /** Action icon */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: () => void | Promise<void>;
  /** Button variant */
  variant?: "primary" | "outline" | "ghost" | "destructive";
  /** Disabled state */
  disabled?: boolean;
  /** Confirm before action */
  confirm?: {
    title: string;
    message: string;
    confirmLabel?: string;
  };
}

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Array of bulk actions */
  actions: BulkAction[];
  /** Clear selection handler */
  onClear: () => void;
  /** Position of the bar */
  position?: "top" | "bottom";
  /** Maximum visible actions before showing "More" dropdown */
  maxVisibleActions?: number;
  /** Show progress during action */
  progress?: {
    current: number;
    total: number;
    message?: string;
  };
  /** Selection limit message */
  maxSelectionMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

export const BulkActionBar = React.forwardRef<
  HTMLDivElement,
  BulkActionBarProps
>(
  (
    {
      selectedCount,
      actions,
      onClear,
      position = "bottom",
      maxVisibleActions = 3,
      progress,
      maxSelectionMessage,
      className,
      ...props
    },
    ref
  ) => {
    const [showMoreActions, setShowMoreActions] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
      action: BulkAction;
      show: boolean;
    } | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    if (selectedCount === 0) return null;

    const handleActionClick = async (action: BulkAction) => {
      if (action.confirm) {
        setConfirmDialog({ action, show: true });
      } else {
        await executeAction(action);
      }
    };

    const executeAction = async (action: BulkAction) => {
      setActionLoading(action.label);
      try {
        await action.onClick();
      } finally {
        setActionLoading(null);
        setConfirmDialog(null);
      }
    };

    const visibleActions = actions.slice(0, maxVisibleActions);
    const moreActions = actions.slice(maxVisibleActions);

    const positionClasses = {
      top: "top-4",
      bottom: "bottom-4",
    };

    return (
      <>
        {/* Bulk Action Bar */}
        <div
          ref={ref}
          className={cn(
            "fixed left-1/2 -translate-x-1/2 z-40",
            "bg-primary text-white rounded-lg shadow-2xl",
            "px-4 py-3 flex items-center gap-4",
            "animate-in slide-in-from-bottom-5 duration-200",
            positionClasses[position],
            className
          )}
          {...props}
        >
          {/* Selection Count */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {selectedCount} {selectedCount === 1 ? "item" : "items"}
              </p>
              {maxSelectionMessage && (
                <p className="text-xs opacity-75">{maxSelectionMessage}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{progress.message || "Processing..."}</span>
                <span>
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {!progress && (
            <div className="flex items-center gap-2">
              {visibleActions.map((action, index) => (
                <UnifiedButton
                  key={index}
                  onClick={() => handleActionClick(action)}
                  variant={action.variant || "outline"}
                  size="sm"
                  disabled={action.disabled || actionLoading !== null}
                  loading={actionLoading === action.label}
                  className="bg-white/10 hover:bg-white/20 border-white/20"
                >
                  {action.icon && (
                    <span className="mr-1">
                      {React.cloneElement(action.icon as React.ReactElement, {
                        className: "w-4 h-4",
                      })}
                    </span>
                  )}
                  {action.label}
                </UnifiedButton>
              ))}

              {/* More Actions Dropdown */}
              {moreActions.length > 0 && (
                <div className="relative">
                  <UnifiedButton
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border-white/20"
                  >
                    More
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </UnifiedButton>

                  {showMoreActions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-lg shadow-lg min-w-[160px] overflow-hidden">
                      {moreActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleActionClick(action);
                            setShowMoreActions(false);
                          }}
                          disabled={action.disabled || actionLoading !== null}
                          className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {action.icon && (
                            <span>
                              {React.cloneElement(
                                action.icon as React.ReactElement,
                                {
                                  className: "w-4 h-4",
                                }
                              )}
                            </span>
                          )}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clear Button */}
          <button
            onClick={onClear}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog?.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg border border-border max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">
                {confirmDialog.action.confirm?.title || "Confirm Action"}
              </h3>
              <p className="text-sm text-textSecondary mb-6">
                {confirmDialog.action.confirm?.message ||
                  `Are you sure you want to perform this action on ${selectedCount} items?`}
              </p>
              <div className="flex justify-end gap-2">
                <UnifiedButton
                  variant="outline"
                  onClick={() => setConfirmDialog(null)}
                  disabled={actionLoading !== null}
                >
                  Cancel
                </UnifiedButton>
                <UnifiedButton
                  variant={confirmDialog.action.variant || "primary"}
                  onClick={() => executeAction(confirmDialog.action)}
                  loading={actionLoading !== null}
                >
                  {confirmDialog.action.confirm?.confirmLabel ||
                    confirmDialog.action.label}
                </UnifiedButton>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

BulkActionBar.displayName = "BulkActionBar";

/**
 * Hook to manage bulk selection state
 */
export function useBulkSelection<T extends { id: string | number }>(
  items: T[]
) {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const toggleItem = (id: string | number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((item) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const isSelected = (id: string | number) => selected.has(id);

  const isAllSelected = items.length > 0 && selected.size === items.length;

  const isSomeSelected = selected.size > 0 && selected.size < items.length;

  return {
    selected,
    selectedCount: selected.size,
    selectedItems: items.filter((item) => selected.has(item.id)),
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}
