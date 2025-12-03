"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
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
