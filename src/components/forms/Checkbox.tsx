import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Checkbox Component
 *
 * A styled checkbox input with optional label and error messaging.
 * Includes custom checkmark icon and focus/hover states.
 *
 * @component
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms and conditions"
 *   error="Please accept the terms"
 *   checked={agreed}
 *   onChange={(e) => setAgreed(e.target.checked)}
 * />
 * ```
 */

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
}

export default function Checkbox({
  label,
  error,
  className = "",
  ...props
}: CheckboxProps) {
  const { themed, typography, input, colors } = THEME_CONSTANTS;

  return (
    <div className="w-full">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className={`
              w-5 h-5 rounded border-2 cursor-pointer
              transition-all appearance-none
              ${error ? themed.borderError : themed.border}
              ${colors.form.checked}
              ${colors.form.focusRing}
              ${input.disabled}
              ${className}
            `}
            {...props}
          />
          <svg
            className={`absolute w-3 h-3 ${colors.form.checkmark} pointer-events-none hidden peer-checked:block`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {label && (
          <span
            className={`${typography.small} ${themed.textSecondary} select-none`}
          >
            {label}
          </span>
        )}
      </label>

      {error && (
        <p
          className={`mt-1.5 ${typography.small} ${themed.textError} flex items-center gap-1 ml-8`}
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
    </div>
  );
}
