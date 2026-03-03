import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";
import { Label, Span, Text } from "../typography/Typography";

/**
 * Radio Component
 *
 * A radio button group component for selecting a single option from multiple choices.
 * Supports horizontal and vertical orientations, error states, and disabled options.
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
}

export default function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  orientation = "vertical",
}: RadioGroupProps) {
  const { themed, typography, input, colors, flex } = THEME_CONSTANTS;

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
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
      >
        {options.map((option) => (
          <Label
            key={option.value}
            className={`
              ${flex.rowCenter} gap-3 cursor-pointer group
              ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <div className={`relative ${flex.center}`}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={`
                  w-5 h-5 rounded-full border-2 cursor-pointer
                  transition-all appearance-none
                  ${error ? themed.borderError : themed.border}
                  ${colors.form.radioChecked}
                  ${colors.form.focusRing}
                  ${input.disabled}
                `}
              />
            </div>

            <Span
              className={`${typography.small} ${themed.textSecondary} select-none`}
            >
              {option.label}
            </Span>
          </Label>
        ))}
      </div>

      {error && (
        <Text
          className={`mt-1.5 ${typography.small} ${themed.textError} ${flex.rowCenter} gap-1`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
