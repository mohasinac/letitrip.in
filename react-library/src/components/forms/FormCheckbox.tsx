"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { announceToScreenReader } from "../../utils/accessibility";
import { cn } from "../../utils/cn";

export interface FormCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
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

    const prevErrorRef = useRef<string | undefined>();

    // Announce errors to screen readers
    useEffect(() => {
      if (error && error !== prevErrorRef.current) {
        announceToScreenReader(`Error: ${error}`, "assertive");
      }
      prevErrorRef.current = error;
    }, [error]);

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
              props.disabled && "cursor-not-allowed opacity-60"
            )}
            aria-invalid={!!error}
            aria-required={props.required}
            aria-checked={props.checked}
            aria-describedby={
              error
                ? `${checkboxId}-error`
                : description
                ? `${checkboxId}-description`
                : undefined
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
              props.disabled && "cursor-not-allowed opacity-60"
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
            <p
              id={`${checkboxId}-error`}
              className="mt-1 text-red-600 dark:text-red-400"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

export default FormCheckbox;
