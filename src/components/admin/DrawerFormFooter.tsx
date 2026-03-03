"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

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
  submitLabel,
  deleteLabel,
  cancelLabel,
  isLoading = false,
  isSubmitDisabled = false,
  className = "",
}: DrawerFormFooterProps) {
  const t = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const { themed, flex } = THEME_CONSTANTS;

  const resolvedSubmitLabel = submitLabel ?? t("save");
  const resolvedDeleteLabel = deleteLabel ?? t("delete");
  const resolvedCancelLabel = cancelLabel ?? t("cancel");

  return (
    <div
      className={`
        ${flex.between} gap-3 
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
            {resolvedDeleteLabel}
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
          {resolvedCancelLabel}
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={isLoading || isSubmitDisabled}
          size="md"
        >
          {isLoading ? tLoading("saving") : resolvedSubmitLabel}
        </Button>
      </div>
    </div>
  );
}
