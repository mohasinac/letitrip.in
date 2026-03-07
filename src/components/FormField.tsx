/**
 * Form Field Component
 *
 * Reusable form field with label, input, error, and validation
 */

"use client";

import React from "react";
import { Input, Label, Select, Span, Text, Textarea } from "@/components";
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
    | "datetime-local"
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
        <Label
          htmlFor={inputId}
          className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
        >
          {label}
          {required && <Span className="text-red-500 ml-1">*</Span>}
        </Label>
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
        <Text size="sm" variant="secondary" className="mt-1">
          {helpText}
        </Text>
      )}

      {showError && (
        <Text
          id={errorId}
          size="sm"
          variant="error"
          className="mt-1"
          role="alert"
        >
          {error}
        </Text>
      )}
    </div>
  );
};

export default FormField;
