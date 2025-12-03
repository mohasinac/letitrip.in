"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label: string | ReactNode;
  description?: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkboxId =
      id ||
      (typeof label === "string"
        ? label.toLowerCase().replace(/\s+/g, "-")
        : `checkbox-${Math.random().toString(36).slice(2, 9)}`);

    return (
      <div className={cn("relative flex items-start", className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              "h-4 w-4 rounded border transition-colors cursor-pointer",
              "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              error
                ? "border-red-500 text-red-600"
                : "border-gray-300 dark:border-gray-600 text-blue-600",
              props.disabled && "cursor-not-allowed opacity-60",
            )}
            aria-invalid={!!error}
            aria-describedby={
              description ? `${checkboxId}-description` : undefined
            }
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={checkboxId}
            className={cn(
              "font-medium cursor-pointer",
              error
                ? "text-red-600 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300",
              props.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {label}
          </label>
          {description && (
            <p
              id={`${checkboxId}-description`}
              className="text-gray-500 dark:text-gray-400"
            >
              {description}
            </p>
          )}
          {error && (
            <p className="mt-1 text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  },
);

FormCheckbox.displayName = "FormCheckbox";

export default FormCheckbox;
