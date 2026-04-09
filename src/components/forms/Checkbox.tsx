import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Span, Text } from "@mohasinac/appkit/ui";

/**
 * Checkbox Component
 *
 * A styled checkbox input with a visible tick/check icon when checked.
 * Includes custom checkmark SVG overlay, focus/hover states, and error messaging.
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
  /** Extra content rendered after the label text inside the checkbox row */
  suffix?: React.ReactNode;
  error?: string;
  /** Indeterminate state — shows a dash instead of a tick */
  indeterminate?: boolean;
}

export default function Checkbox({
  label,
  suffix,
  error,
  indeterminate,
  className = "",
  checked,
  ...props
}: CheckboxProps) {
  const {
    themed,
    typography,
    input: inputStyles,
    colors,
    flex,
  } = THEME_CONSTANTS;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const isChecked = checked || indeterminate;

  return (
    <div className="w-full">
      <label className={`${flex.rowStart} gap-3 cursor-pointer group`}>
        <div className={`relative ${flex.center} flex-shrink-0`}>
          <input
            ref={inputRef}
            type="checkbox"
            checked={checked}
            className={`
              peer w-5 h-5 rounded-md border-2 cursor-pointer
              transition-all duration-200 appearance-none
              ${
                error
                  ? "border-red-400 dark:border-red-500"
                  : "border-zinc-300 dark:border-slate-600"
              }
              checked:bg-primary-600 checked:border-primary-600
              dark:checked:bg-secondary-500 dark:checked:border-secondary-500
              hover:border-primary-400 dark:hover:border-secondary-400
              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1
              dark:focus:ring-secondary-400/30 dark:focus:ring-offset-slate-900
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {/* Tick icon — visible when checked */}
          <svg
            className="absolute w-3.5 h-3.5 text-white dark:text-slate-950 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {indeterminate ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            )}
          </svg>
        </div>

        {label && (
          <Span
            className={`${typography.small} ${themed.textSecondary} select-none flex-1 group-hover:${themed.textPrimary}`}
          >
            {label}
          </Span>
        )}
        {suffix}
      </label>

      {error && (
        <Text
          className={`mt-1.5 ${typography.small} ${themed.textError} ${flex.rowCenter} gap-1 ml-8`}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </Text>
      )}
    </div>
  );
}
