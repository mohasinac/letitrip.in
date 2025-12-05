/**
 * @fileoverview React Component
 * @module src/components/forms/FormFieldset
 * @description This file contains the FormFieldset component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * FormFieldsetProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormFieldsetProps
 */
export interface FormFieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Legend */
  legend?: string;
  /** Description */
  description?: string;
  /** Required */
  required?: boolean;
  /** Error */
  error?: string;
  /** Children */
  children: React.ReactNode;
}

/**
 * FormFieldset - Group related form fields with legend
 *
 * Features:
 * - Semantic fieldset/legend structure
 * - Optional description
 * - Error display
 * - Dark mode support
 */
/**
 * Performs form fieldset operation
 *
 * @returns {any} The formfieldset result
 *
 * @example
 * FormFieldset();
 */

/**
 * F
 * @constant
 */
/**
 * Performs form fieldset operation
 *
 * @returns {any} The formfieldset result
 *
 * @example
 * FormFieldset();
 */

/**
 * F
 * @constant
 */
export const FormFieldset: React.FC<FormFieldsetProps> = ({
  legend,
  description,
  required,
  error,
  children,
  className,
  ...props
}) => {
  return (
    <fieldset
      className={cn(
        "space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg",
        error && "border-red-300 dark:border-red-700",
        className,
      )}
      {...props}
    >
      {legend && (
        <legend className="text-sm font-medium text-gray-900 dark:text-white px-2">
          {legend}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
          {description}
        </p>
      )}

      {children}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default FormFieldset;
