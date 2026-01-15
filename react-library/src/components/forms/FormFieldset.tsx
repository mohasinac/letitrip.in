/**
 * FormFieldset Component
 *
 * Groups related form fields with a legend and optional description.
 *
 * @example
 * ```tsx
 * <FormFieldset
 *   legend="Personal Information"
 *   description="Please provide your basic details"
 *   required
 * >
 *   <FormInput label="First Name" name="firstName" />
 *   <FormInput label="Last Name" name="lastName" />
 *   <FormInput label="Email" name="email" type="email" />
 * </FormFieldset>
 * ```
 */

import React from "react";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface FormFieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Legend text displayed at the top of the fieldset */
  legend?: string;
  /** Optional description text below the legend */
  description?: string;
  /** Whether any field in the fieldset is required */
  required?: boolean;
  /** Error message for the fieldset */
  error?: string;
  /** Form fields to group */
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
