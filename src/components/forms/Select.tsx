import React from "react";
import { Label } from "../typography/Typography";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Select Component
 *
 * A styled dropdown select input with optional label, error message, and helper text.
 * Includes custom chevron icon and supports all native select attributes.
 *
 * @component
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' }
 *   ]}
 *   error="Please select a country"
 *   helperText="Select your current location"
 * />
 * ```
 */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  className = "",
  required,
  ...props
}: SelectProps) {
  const { input, themed } = THEME_CONSTANTS;

  return (
    <div className="w-full">
      {label && <Label required={required}>{label}</Label>}

      <div className="relative">
        <select
          className={`
            ${input.base}
            pr-10 appearance-none cursor-pointer
            ${
              error
                ? `${themed.borderError} focus:ring-red-500`
                : `${themed.border} ${themed.focusRing}`
            }
            ${themed.bgInput}
            ${themed.textPrimary}
            ${input.disabled}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 ${themed.textMuted}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p
          className={`mt-1.5 text-sm ${themed.textError} flex items-center gap-1`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className={`mt-1.5 text-sm ${themed.textMuted}`}>{helperText}</p>
      )}
    </div>
  );
}
