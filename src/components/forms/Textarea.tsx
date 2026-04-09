import React from "react";
import { Label, Text } from "../typography/Typography";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@mohasinac/appkit/ui";

/**
 * Textarea Component
 *
 * A styled multi-line text input with optional label, error message, and helper text.
 * Supports vertical resizing, character count, and all native textarea attributes.
 *
 * @component
 * @example
 * ```tsx
 * <Textarea
 *   label="Message"
 *   placeholder="Enter your message"
 *   rows={5}
 *   error="Message is required"
 *   helperText="Max 500 characters"
 *   maxLength={500}
 *   showCharCount
 * />
 * ```
 */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  /** Show a character count indicator when maxLength is set */
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      helperText,
      showCharCount,
      className = "",
      required,
      maxLength,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) {
    const { input, themed, flex } = THEME_CONSTANTS;
    const charCount =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : 0;

    return (
      <div className="w-full">
        {label && <Label required={required}>{label}</Label>}

        <textarea
          ref={ref}
          className={classNames(
            "w-full",
            input.base,
            "resize-y min-h-[80px]",
            error ? input.error : "",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          {...props}
        />

        <div className={`${flex.between} mt-1.5`}>
          <div className="flex-1">
            {error && (
              <Text
                className={`text-sm ${themed.textError} flex items-center gap-1`}
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
              <Text className={`text-sm ${themed.textMuted}`}>
                {helperText}
              </Text>
            )}
          </div>

          {showCharCount && maxLength && (
            <Text
              className={classNames(
                "text-xs tabular-nums ml-2 flex-shrink-0",
                charCount >= maxLength ? themed.textError : themed.textMuted,
              )}
            >
              {charCount}/{maxLength}
            </Text>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
