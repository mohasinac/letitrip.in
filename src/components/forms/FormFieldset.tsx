"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
  description?: string;
  required?: boolean;
  error?: string;
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
        className
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
