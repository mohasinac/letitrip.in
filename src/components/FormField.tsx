/**
 * Form Field Component
 *
 * Reusable form field with label, input, error, and validation
 */

"use client";

import React from "react";
import { Input, Textarea, Select } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldProps {
  label?: string;
  name: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number"
    | "textarea"
    | "select";
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  rows?: number;
  helpText?: string;
  options?: SelectOption[];
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  rows,
  helpText,
  options = [],
}) => {
  const showError = error
    ? touched !== undefined
      ? touched && !!error
      : !!error
    : false;
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  const ariaProps = {
    "aria-required": required || undefined,
    "aria-invalid": showError || undefined,
    "aria-describedby": showError ? errorId : undefined,
  };

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "select" ? (
        <Select
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          options={options}
          className={showError ? "border-red-500" : ""}
          {...ariaProps}
        />
      ) : type === "textarea" ? (
        <Textarea
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={showError ? "border-red-500" : ""}
          {...ariaProps}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={showError ? "border-red-500" : ""}
          {...ariaProps}
        />
      )}

      {helpText && !showError && (
        <p className={`mt-1 text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
          {helpText}
        </p>
      )}

      {showError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
