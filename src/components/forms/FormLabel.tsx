/**
 * @fileoverview React Component
 * @module src/components/forms/FormLabel
 * @description This file contains the FormLabel component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * FormLabelProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormLabelProps
 */
export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Children */
  children: React.ReactNode;
  /** Required */
  required?: boolean;
  /** Optional */
  optional?: boolean;
  /** Hint */
  hint?: string;
}

/**
 * FormLabel - Consistent label component with dark mode and accessibility
 *
 * Features:
 * - Required/optional indicators
 * - Hint text support
 * - Dark mode support
 * - Proper htmlFor connection
 */
/**
 * Performs form label operation
 *
 * @returns {any} The formlabel result
 *
 * @example
 * FormLabel();
 */

/**
 * F
 * @constant
 */
/**
 * Performs form label operation
 *
 * @returns {any} The formlabel result
 *
 * @example
 * FormLabel();
 */

/**
 * F
 * @constant
 */
export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  required,
  optional,
  hint,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
      {optional && (
        <span className="text-gray-400 dark:text-gray-500 ml-1 font-normal">
          (optional)
        </span>
      )}
      {hint && (
        <span className="text-gray-400 dark:text-gray-500 text-xs ml-2 font-normal">
          {hint}
        </span>
      )}
    </label>
  );
};

export default FormLabel;
