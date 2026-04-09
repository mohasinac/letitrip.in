import React from "react";
import { Label, Text } from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@mohasinac/appkit/ui";

/**
 * Input Component
 *
 * A styled text input with enhanced focus states, error handling, and success validation.
 * Supports all native HTML input attributes with improved accessibility.
 *
 * @component
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error="Invalid email format"
 *   helperText="We'll never share your email"
 *   icon={<EmailIcon />}
 * />
 * ```
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  /** Icon or element rendered on the right side of the input */
  rightIcon?: React.ReactNode;
  success?: boolean;
  /** Render only the input element without wrapper/layout chrome. */
  bare?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    icon,
    rightIcon,
    success,
    bare = false,
    className = "",
    required,
    disabled,
    ...props
  },
  ref,
) {
  const { input, themed } = THEME_CONSTANTS;

  const stateClasses = error
    ? input.error
    : success
      ? input.success
      : disabled
        ? input.disabled
        : "";

  if (bare) {
    return (
      <input
        ref={ref}
        className={classNames(className, stateClasses)}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  }

  return (
    <div className="w-full">
      {label && <Label required={required}>{label}</Label>}

      <div className="relative group">
        {icon && (
          <div
            className={classNames(
              "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150",
              error ? themed.textError : themed.textMuted,
              "group-focus-within:text-primary-500 dark:group-focus-within:text-secondary-400",
            )}
          >
            {icon}
          </div>
        )}

        <input
          ref={ref}
          className={classNames(
            "w-full",
            input.base,
            icon ? input.withIcon : "",
            rightIcon ? "pr-10" : "",
            stateClasses,
            className,
          )}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />

        {rightIcon && (
          <div
            className={classNames(
              "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150",
              error ? themed.textError : themed.textMuted,
            )}
          >
            {rightIcon}
          </div>
        )}

        {/* Success indicator */}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <Text
          className={`mt-1.5 text-sm ${themed.textError} flex items-center gap-1`}
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

      {helperText && !error && (
        <Text className={`mt-1.5 text-sm ${themed.textMuted}`}>
          {helperText}
        </Text>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
