import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@mohasinac/appkit/ui";
import { Label, Span, Text } from "@mohasinac/appkit/ui";

/**
 * RadioGroup Component
 *
 * A radio button group rendered as toggle-switch style selectors.
 * Each option appears as a pill/card that lights up when selected,
 * giving a modern switch-like look instead of traditional radio dots.
 *
 * @component
 * @example
 * ```tsx
 * <RadioGroup
 *   name="plan"
 *   label="Select a plan"
 *   value={selectedPlan}
 *   onChange={(value) => setSelectedPlan(value)}
 *   options={[
 *     { value: 'basic', label: 'Basic Plan' },
 *     { value: 'pro', label: 'Pro Plan', disabled: false }
 *   ]}
 *   orientation="vertical"
 * />
 * ```
 */

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  orientation?: "vertical" | "horizontal";
  /** Visual style: "toggle" renders pill-style selectors, "classic" renders dot-style */
  variant?: "toggle" | "classic";
}

export default function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  orientation = "vertical",
  variant = "toggle",
}: RadioGroupProps) {
  const { themed, typography, flex } = THEME_CONSTANTS;

  if (variant === "classic") {
    return (
      <div className="w-full">
        {label && (
          <Label
            className={`block ${typography.small} font-medium ${themed.textSecondary} mb-2`}
          >
            {label}
          </Label>
        )}

        <div
          className={classNames(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          )}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <Label
                key={option.value}
                className={classNames(
                  `${flex.rowCenter} gap-3 cursor-pointer group`,
                  option.disabled ? "opacity-50 cursor-not-allowed" : "",
                )}
              >
                <div className={`relative ${flex.center} flex-shrink-0`}>
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={option.disabled}
                    className="peer sr-only"
                  />
                  {/* Outer ring */}
                  <div
                    className={classNames(
                      "w-5 h-5 rounded-full border-2 transition-all duration-200",
                      flex.center,
                      error
                        ? "border-red-400 dark:border-red-500"
                        : isSelected
                          ? "border-primary-600 dark:border-secondary-500"
                          : "border-zinc-300 dark:border-slate-600 group-hover:border-primary-400 dark:group-hover:border-secondary-400",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/30 peer-focus-visible:ring-offset-1 dark:peer-focus-visible:ring-secondary-400/30 dark:peer-focus-visible:ring-offset-slate-900",
                    )}
                  >
                    {/* Inner dot */}
                    <div
                      className={classNames(
                        "w-2.5 h-2.5 rounded-full transition-all duration-200",
                        isSelected
                          ? "bg-primary-600 dark:bg-secondary-500 scale-100"
                          : "bg-transparent scale-0",
                      )}
                    />
                  </div>
                </div>

                <Span
                  className={`${typography.small} ${themed.textSecondary} select-none`}
                >
                  {option.label}
                </Span>
              </Label>
            );
          })}
        </div>

        {error && (
          <Text
            className={`mt-1.5 ${typography.small} ${themed.textError} ${flex.rowCenter} gap-1`}
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

  // Toggle variant — pill-style selectors
  return (
    <div className="w-full">
      {label && (
        <Label
          className={`block ${typography.small} font-medium ${themed.textSecondary} mb-2`}
        >
          {label}
        </Label>
      )}

      <div
        className={classNames(
          "flex gap-2",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={classNames(
                "relative cursor-pointer select-none",
                option.disabled ? "opacity-50 cursor-not-allowed" : "",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className="peer sr-only"
              />
              <div
                className={classNames(
                  "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200",
                  flex.rowCenter,
                  "gap-2",
                  isSelected
                    ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-secondary-500 dark:bg-secondary-950/30 dark:text-secondary-400"
                    : classNames(
                        "border-zinc-200 dark:border-slate-700",
                        themed.bgPrimary,
                        themed.textSecondary,
                        option.disabled
                          ? ""
                          : "hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-secondary-600 dark:hover:bg-secondary-950/10",
                      ),
                  error && !isSelected
                    ? "border-red-300 dark:border-red-500/40"
                    : "",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/30 peer-focus-visible:ring-offset-1 dark:peer-focus-visible:ring-secondary-400/30",
                )}
              >
                {/* Toggle indicator dot */}
                <div
                  className={classNames(
                    "w-3 h-3 rounded-full border-2 transition-all duration-200 flex-shrink-0",
                    isSelected
                      ? "border-primary-600 bg-primary-600 dark:border-secondary-500 dark:bg-secondary-500"
                      : "border-zinc-300 dark:border-slate-600 bg-transparent",
                  )}
                >
                  {isSelected && (
                    <div
                      className={`w-full h-full rounded-full ${flex.center}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950" />
                    </div>
                  )}
                </div>
                <Span className="text-sm font-medium">{option.label}</Span>
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <Text
          className={`mt-1.5 ${typography.small} ${themed.textError} ${flex.rowCenter} gap-1`}
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
