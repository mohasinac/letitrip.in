/**
 * FormNumberInput Component
 *
 * Framework-agnostic number input with validation, prefix/suffix, and decimal support.
 *
 * @example
 * ```tsx
 * // Basic number input
 * <FormNumberInput
 *   label="Quantity"
 *   value={quantity}
 *   onChange={(e) => setQuantity(e.target.value)}
 *   min={0}
 * />
 *
 * // Price input with prefix
 * <FormNumberInput
 *   label="Price"
 *   prefix="₹"
 *   value={price}
 *   onChange={(e) => setPrice(e.target.value)}
 *   allowDecimals
 *   decimalPlaces={2}
 * />
 *
 * // With suffix and helper text
 * <FormNumberInput
 *   label="Weight"
 *   suffix="kg"
 *   value={weight}
 *   onChange={(e) => setWeight(e.target.value)}
 *   allowDecimals
 *   helperText="Enter product weight"
 * />
 * ```
 */

import { forwardRef, InputHTMLAttributes } from "react";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface FormNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Text to display before the input */
  prefix?: string;
  /** Text to display after the input */
  suffix?: string;
  /** Whether the input should take full width (default: true) */
  fullWidth?: boolean;
  /** Compact size with less padding (default: false) */
  compact?: boolean;
  /** Allow decimal numbers (default: false) */
  allowDecimals?: boolean;
  /** Number of decimal places when allowDecimals is true (default: 2) */
  decimalPlaces?: number;
}

export const FormNumberInput = forwardRef<
  HTMLInputElement,
  FormNumberInputProps
>(
  (
    {
      label,
      error,
      helperText,
      prefix,
      suffix,
      className,
      fullWidth = true,
      compact = false,
      allowDecimals = false,
      decimalPlaces = 2,
      id,
      min = 0,
      step,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const computedStep =
      step ?? (allowDecimals ? Math.pow(10, -decimalPlaces) : 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Allow empty value
      if (value === "") {
        onChange?.(e);
        return;
      }

      // Validate number format
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onChange?.(e);
      }
    };

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex">
          {prefix && (
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type="number"
            inputMode={allowDecimals ? "decimal" : "numeric"}
            min={min}
            step={computedStep}
            onChange={handleChange}
            className={cn(
              "flex-1 rounded-lg border text-sm transition-colors duration-200",
              compact ? "px-3 py-1.5" : "px-3 py-2",
              "focus:outline-none focus:ring-1",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              props.disabled &&
                "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
              prefix && "rounded-l-none",
              suffix && "rounded-r-none",
              // Hide number spinners
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {suffix && (
            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>

        {/* Error or Helper Text */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormNumberInput.displayName = "FormNumberInput";
