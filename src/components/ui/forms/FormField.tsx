/**
 * FormField Component
 *
 * Unified form field wrapper that handles label, input, error, and hint display.
 * Automatically associates label with input for accessibility.
 *
 * @example
 * <FormField
 *   label="Product Name"
 *   name="name"
 *   value={formData.name}
 *   onChange={handleChange}
 *   error={errors.name}
 *   hint="Enter a descriptive product name"
 *   required={true}
 * />
 */

"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { UnifiedInput } from "@/components/ui/unified/Input";

export interface FormFieldProps {
  /** Field label */
  label: string;
  /** Field name (used for id and name attributes) */
  name: string;
  /** Field value */
  value: string | number;
  /** Change handler */
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  /** Input type */
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "textarea"
    | "select";
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Prefix text (e.g., "$" for currency) */
  prefix?: string;
  /** Suffix text (e.g., "kg" for weight) */
  suffix?: string;
  /** Show character counter */
  showCounter?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Minimum value (for number inputs) */
  min?: number;
  /** Maximum value (for number inputs) */
  max?: number;
  /** Step value (for number inputs) */
  step?: number;
  /** Textarea rows */
  rows?: number;
  /** Select options (only for type="select") */
  options?: Array<{ value: string | number; label: string }>;
  /** Additional CSS classes */
  className?: string;
  /** Input CSS classes */
  inputClassName?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Autocomplete attribute */
  autoComplete?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      type = "text",
      error,
      hint,
      required = false,
      disabled = false,
      placeholder,
      icon,
      prefix,
      suffix,
      showCounter = false,
      maxLength,
      min,
      max,
      step,
      rows = 4,
      options = [],
      className,
      inputClassName,
      autoFocus = false,
      autoComplete,
    },
    ref
  ) => {
    const uniqueId = useId();
    const fieldId = `field-${name}-${uniqueId}`;
    const hintId = hint ? `hint-${fieldId}` : undefined;
    const errorId = error ? `error-${fieldId}` : undefined;

    const characterCount = typeof value === "string" ? value.length : 0;

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {/* Label */}
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-text"
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {/* Input with optional prefix/suffix */}
        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary text-sm pointer-events-none">
              {prefix}
            </div>
          )}

          {/* Icon */}
          {icon && !prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input Field */}
          {type === "textarea" ? (
            <textarea
              id={fieldId}
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              required={required}
              maxLength={maxLength}
              rows={rows}
              autoFocus={autoFocus}
              autoComplete={autoComplete}
              aria-describedby={cn(hintId, errorId)}
              aria-invalid={!!error}
              className={cn(
                "w-full px-3 py-2 border rounded-lg transition-colors resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                error
                  ? "border-error focus:border-error"
                  : "border-border focus:border-primary",
                disabled && "bg-surfaceVariant cursor-not-allowed opacity-60",
                prefix && "pl-8",
                suffix && "pr-8",
                inputClassName
              )}
            />
          ) : type === "select" ? (
            <select
              id={fieldId}
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              required={required}
              aria-describedby={cn(hintId, errorId)}
              aria-invalid={!!error}
              className={cn(
                "w-full px-3 py-2 border rounded-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "bg-surface text-text appearance-none pr-10",
                error
                  ? "border-error focus:border-error"
                  : "border-border focus:border-primary",
                disabled && "bg-surfaceVariant cursor-not-allowed opacity-60",
                inputClassName
              )}
            >
              <option value="">Select {label}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <UnifiedInput
              id={fieldId}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              required={required}
              maxLength={maxLength}
              min={min}
              max={max}
              step={step}
              autoFocus={autoFocus}
              autoComplete={autoComplete}
              error={!!error}
              aria-describedby={cn(hintId, errorId)}
              className={cn(
                prefix && "pl-8",
                suffix && "pr-8",
                icon && !prefix && "pl-10",
                inputClassName
              )}
            />
          )}

          {/* Suffix */}
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary text-sm pointer-events-none">
              {suffix}
            </div>
          )}
        </div>

        {/* Error Message, Hint, and Character Counter */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Error Message */}
            {error && (
              <p id={errorId} className="text-xs text-error" role="alert">
                {error}
              </p>
            )}

            {/* Hint Text */}
            {hint && !error && (
              <p id={hintId} className="text-xs text-textSecondary">
                {hint}
              </p>
            )}
          </div>

          {/* Character Counter */}
          {showCounter && maxLength && type !== "select" && (
            <p
              className={cn(
                "text-xs flex-shrink-0",
                characterCount > maxLength
                  ? "text-error"
                  : characterCount > maxLength * 0.9
                  ? "text-warning"
                  : "text-textSecondary"
              )}
            >
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
