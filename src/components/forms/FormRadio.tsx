/**
 * @fileoverview React Component
 * @module src/components/forms/FormRadio
 * @description This file contains the FormRadio component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { forwardRef, InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * FormRadioProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormRadioProps
 */
export interface FormRadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Label */
  label: string;
  /** Description */
  description?: string;
  /** Has Error */
  hasError?: boolean;
}

/**
 * FormRadio - Single radio button with label
 *
 * Features:
 * - Auto-generated id for accessibility
 * - Optional description text
 * - Error state styling
 * - Dark mode support
 */
export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  ({ label, description, hasError, className, id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={cn(
            "mt-1 h-4 w-4 border-gray-300 dark:border-gray-600",
            "text-blue-600 focus:ring-blue-500 focus:ring-offset-0",
            "dark:bg-gray-800 dark:checked:bg-blue-600",
            hasError && "border-red-500",
            props.disabled && "opacity-50 cursor-not-allowed",
          )}
          {...props}
        />
        <div className="flex-1">
          <label
            htmlFor={radioId}
            className={cn(
              "text-sm font-medium text-gray-700 dark:text-gray-300",
              props.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  },
);

FormRadio.displayName = "FormRadio";

/**
 * FormRadioGroupProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormRadioGroupProps
 */
export interface FormRadioGroupProps {
  /** Name */
  name: string;
  /** Label */
  label?: string;
  /** Required */
  required?: boolean;
  /** Error */
  error?: string;
  /** Children */
  children: React.ReactNode;
  /** Class Name */
  className?: string;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
}

/**
 * FormRadioGroup - Group of radio buttons with shared name
 */
/**
 * Performs form radio group operation
 *
 * @returns {any} The formradiogroup result
 *
 * @example
 * FormRadioGroup();
 */

/**
 * F
 * @constant
 */
/**
 * Performs form radio group operation
 *
 * @returns {any} The formradiogroup result
 *
 * @example
 * FormRadioGroup();
 */

/**
 * F
 * @constant
 */
export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  name,
  label,
  required,
  error,
  children,
  className,
  orientation = "vertical",
}) => {
  return (
    <fieldset className={cn("space-y-2", className)}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}

      <div
        className={cn(
          orientation === "horizontal"
            ? "flex flex-wrap gap-4"
            : "flex flex-col gap-2",
        )}
        role="radiogroup"
        aria-required={required}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<FormRadioProps>(child)) {
            return React.cloneElement(child, { name, hasError: !!error });
          }
          return child;
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default FormRadio;
