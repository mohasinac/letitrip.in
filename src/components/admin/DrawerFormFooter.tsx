"use client";

import { Button } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";

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
  /**
   * "footer" (default) — placed in SideDrawer footer prop; the drawer wrapper
   * supplies the border and background, so none are added here.
   * "inline" — placed inside the scrollable content area; adds its own
   * top border separator.
   */
  variant?: "footer" | "inline";
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
  variant = "footer",
}: DrawerFormFooterProps) {
  const t = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const { themed } = THEME_CONSTANTS;

  const resolvedSubmitLabel = submitLabel ?? t("save");
  const resolvedDeleteLabel = deleteLabel ?? t("delete");
  const resolvedCancelLabel = cancelLabel ?? t("cancel");

  return (
    <div
      className={`flex items-center gap-3${
        variant === "inline" ? ` pt-4 border-t ${themed.border}` : ""
      } ${className}`}
    >
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

      <div className={`flex items-center gap-3${!onDelete ? " ml-auto" : ""}`}>
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
