"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { BulkActionBarProps, BulkAction } from "@/types/inline-edit";
import { ConfirmDialog } from "./ConfirmDialog";

export function BulkActionBar({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
  loading,
  resourceName = "item",
  totalCount,
}: BulkActionBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [inputValue, setInputValue] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleActionClick = (action: BulkAction) => {
    if (action.confirm) {
      setConfirmAction(action);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction, input?: any) => {
    try {
      setActionLoading(true);
      await onAction(action.id, input);
      setConfirmAction(null);
      setInputValue(null);
    } catch (error) {
      console.error("Failed to execute bulk action:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getVariantClasses = (variant: BulkAction["variant"]) => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  const resourceNamePlural = resourceName + "s";

  return (
    <>
      {/* Desktop: Top Bar */}
      <div className="hidden md:flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-gray-900">
            {selectedCount}{" "}
            {selectedCount === 1 ? resourceName : resourceNamePlural} selected
            {totalCount && ` (of ${totalCount})`}
          </p>
          <button
            onClick={onClearSelection}
            disabled={loading || actionLoading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            type="button"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={loading || actionLoading || action.disabled}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
                  action.variant
                )}`}
                type="button"
              >
                {Icon && <Icon className="w-4 h-4" />}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-lg z-40 safe-bottom">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900">
              {selectedCount} selected
            </p>
            <button
              onClick={onClearSelection}
              disabled={loading || actionLoading}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              type="button"
              aria-label="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  disabled={loading || actionLoading || action.disabled}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
                    action.variant
                  )}`}
                  type="button"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    Icon && <Icon className="w-4 h-4" />
                  )}
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          title={confirmAction.confirmTitle || `Confirm ${confirmAction.label}`}
          description={
            confirmAction.confirmMessage ||
            `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedCount} ${
              selectedCount === 1 ? resourceName : resourceNamePlural
            }?`
          }
          confirmLabel={confirmAction.label}
          variant={
            confirmAction.variant === "danger"
              ? "danger"
              : confirmAction.variant === "warning"
              ? "warning"
              : "info"
          }
          onConfirm={() => executeAction(confirmAction, inputValue)}
          onClose={() => {
            setConfirmAction(null);
            setInputValue(null);
          }}
          isLoading={actionLoading}
        />
      )}
    </>
  );
}
