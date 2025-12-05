/**
 * @fileoverview React Component
 * @module src/components/forms/FormField
 * @description This file contains the FormField component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { FormLabel } from "./FormLabel";

/**
 * FormFieldProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormFieldProps
 */
export interface FormFieldProps {
  /** Id */
  id?: string;
  /** Label */
  label: string;
  /** Required */
  required?: boolean;
  /** Optional */
  optional?: boolean;
  /** Hint */
  hint?: string;
  /** Error */
  error?: string;
  /** Helper Text */
  helperText?: string;
  /** Children */
  children: React.ReactElement;
  /** Class Name */
  className?: string;
  /** Label Class Name */
  labelClassName?: string;
}

/**
 * FormField - Label + Input combo with automatic id/htmlFor connection
 *
 * Features:
 * - Auto-generates id if not provided
 * - Connects label htmlFor to input id automatically
 * - Error and helper text display
 * - ARIA attributes for accessibility
 * - Dark mode support
 */
/**
 * Performs form field operation
 *
 * @returns {any} The formfield result
 *
 * @example
 * FormField();
 */

/**
 * F
 * @constant
 */
/**
 * Performs form field operation
 *
 * @returns {any} The formfield result
 *
 * @example
 * FormField();
 */

/**
 * F
 * @constant
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  optional,
  hint,
  error,
  helperText,
  children,
  className,
  labelClassName,
}) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  // Clone child to inject id and aria attributes
  const childWithProps = React.cloneElement(children, {
    /** Id */
    id: fieldId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : helperText ? helperId : undefined,
    ...children.props,
  });

  return (
    <div className={cn("space-y-1", className)}>
      <FormLabel
        htmlFor={fieldId}
        required={required}
        optional={optional}
        hint={hint}
        className={labelClassName}
      >
        {label}
      </FormLabel>

      {childWithProps}

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FormField;
