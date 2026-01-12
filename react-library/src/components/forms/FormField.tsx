"use client";

import { cn } from "../../utils/cn";
import React, { useId } from "react";
import { FormLabel } from "./FormLabel";

export interface FormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  helperText?: string;
  children: React.ReactElement;
  className?: string;
  labelClassName?: string;
  /**
   * Enable auto-sanitization on blur for child input
   * Will be passed to the child component if it supports sanitization
   * @default false
   */
  sanitize?: boolean;
  /**
   * Type of sanitization to apply
   * Will be passed to the child component
   */
  sanitizeType?: "string" | "email" | "phone" | "url" | "html";
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
  sanitize,
  sanitizeType,
}) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  // Clone child to inject id, aria attributes, and sanitization props
  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : helperText ? helperId : undefined,
    // Pass sanitization props if they're defined
    ...(sanitize !== undefined && { sanitize }),
    ...(sanitizeType !== undefined && { sanitizeType }),
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
