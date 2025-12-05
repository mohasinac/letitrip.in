/**
 * @fileoverview React Component
 * @module src/components/ui/FormActions
 * @description This file contains the FormActions component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { Button, ButtonProps } from "./Button";

/**
 * FormActionsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormActionsProps
 */
export interface FormActionsProps {
  /** On Cancel */
  onCancel?: () => void;
  /** On Submit */
  onSubmit?: (() => void) | ((e: React.FormEvent) => void);
  /** Submit Label */
  submitLabel?: string;
  /** Cancel Label */
  cancelLabel?: string;
  /** Is Submitting */
  isSubmitting?: boolean;
  /** Submit Disabled */
  submitDisabled?: boolean;
  /** Cancel Disabled */
  cancelDisabled?: boolean;
  /** Show Cancel */
  showCancel?: boolean;
  /** Submit Variant */
  submitVariant?: ButtonProps["variant"];
  /** Class Name */
  className?: string;
  /** Position */
  position?: "left" | "right" | "space-between";
  /** Additional Actions */
  additionalActions?: React.ReactNode;
}

/**
 * Performs form actions operation
 *
 * @returns {any} The formactions result
 *
 * @example
 * FormActions();
 */

/**
 * F
 * @constant
 */
/**
 * Performs form actions operation
 *
 * @returns {any} The formactions result
 *
 * @example
 * FormActions();
 */

/**
 * F
 * @constant
 */
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
    /** Left */
    left: "justify-start",
    /** Right */
    right: "justify-end",
    "space-between": "justify-between",
  };

  return (
    <div
      className={`
        flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4
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

        {onSubmit && (
          <Button
            type="submit"
            variant={submitVariant}
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={submitDisabled || isSubmitting}
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
