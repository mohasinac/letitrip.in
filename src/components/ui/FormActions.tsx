"use client";

import React from "react";
import { Button, ButtonProps } from "./Button";

export interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  showCancel?: boolean;
  submitVariant?: ButtonProps["variant"];
  className?: string;
  position?: "left" | "right" | "space-between";
  additionalActions?: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
  cancelDisabled = false,
  showCancel = true,
  submitVariant = "primary",
  className = "",
  position = "right",
  additionalActions,
}) => {
  const positionClasses = {
    left: "justify-start",
    right: "justify-end",
    "space-between": "justify-between",
  };

  return (
    <div
      className={`
        flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4
        ${positionClasses[position]}
        ${className}
      `}
    >
      {position === "space-between" && additionalActions && (
        <div className="flex items-center gap-3">{additionalActions}</div>
      )}

      <div className="flex items-center gap-3">
        {position !== "space-between" && additionalActions}

        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={cancelDisabled || isSubmitting}
          >
            {cancelLabel}
          </Button>
        )}

        <Button
          type="submit"
          variant={submitVariant}
          onClick={onSubmit}
          isLoading={isSubmitting}
          disabled={submitDisabled || isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};
