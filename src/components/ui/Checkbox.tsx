/**
 * @fileoverview React Component
 * @module src/components/ui/Checkbox
 * @description This file contains the Checkbox component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";

/**
 * CheckboxProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CheckboxProps
 */
export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Label */
  label?: string;
  /** Description */
  description?: string;
}

/**
 * C
 * @constant
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    if (!label) {
      return (
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded
            /** Focus */
            focus:ring-blue-500 focus:ring-2
            /** Disabled */
            disabled:opacity-50 disabled:cursor-not-allowed
            /** Dark */
            dark:bg-gray-800
            ${className}
          `}
          {...props}
        />
      );
    }

    return (
      <label
        htmlFor={checkboxId}
        className="flex items-start gap-3 cursor-pointer group"
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded mt-0.5
            /** Focus */
            focus:ring-blue-500 focus:ring-2
            /** Disabled */
            disabled:opacity-50 disabled:cursor-not-allowed
            /** Dark */
            dark:bg-gray-800
            ${className}
          `}
          {...props}
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
