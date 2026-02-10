"use client";

import { Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { UI_LABELS } from "@/constants";

/**
 * DrawerFormFooter Component
 *
 * Cancel + Save/Delete button pair used in all SideDrawer forms.
 * Provides consistent spacing and button styling for drawer actions.
 *
 * @example
 * ```tsx
 * <DrawerFormFooter
 *   onCancel={() => setShowDrawer(false)}
 *   onSubmit={handleSave}
 *   submitLabel="Save User"
 *   isLoading={saving}
 * />
 *
 * // With delete option
 * <DrawerFormFooter
 *   onCancel={() => setShowDrawer(false)}
 *   onSubmit={handleSave}
 *   onDelete={handleDelete}
 *   submitLabel="Update"
 *   deleteLabel="Delete"
 *   isLoading={saving}
 * />
 * ```
 */

interface DrawerFormFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  className?: string;
}

export function DrawerFormFooter({
  onCancel,
  onSubmit,
  onDelete,
  submitLabel = UI_LABELS.ACTIONS.SAVE,
  deleteLabel = UI_LABELS.ACTIONS.DELETE,
  cancelLabel = UI_LABELS.ACTIONS.CANCEL,
  isLoading = false,
  isSubmitDisabled = false,
  className = "",
}: DrawerFormFooterProps) {
  const { spacing, themed } = THEME_CONSTANTS;

  return (
    <div
      className={`
        flex items-center justify-between gap-3 
        pt-6 border-t ${themed.border}
        ${className}
      `}
    >
      <div>
        {onDelete && (
          <Button
            variant="danger"
            onClick={onDelete}
            disabled={isLoading}
            size="md"
          >
            {deleteLabel}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          size="md"
        >
          {cancelLabel}
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={isLoading || isSubmitDisabled}
          size="md"
        >
          {isLoading ? UI_LABELS.LOADING.SAVING : submitLabel}
        </Button>
      </div>
    </div>
  );
}
