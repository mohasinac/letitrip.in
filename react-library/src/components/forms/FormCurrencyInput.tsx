"use client";

import { PriceCurrency as Currency, formatPrice } from "../../utils/price.utils";
import { cn } from "../../utils/cn";
import { forwardRef, InputHTMLAttributes, useState } from "react";

// Common currencies for the platform
const CURRENCIES: Array<{ code: Currency; symbol: string; name: string }> = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
] as const;

export interface FormCurrencyInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange" | "type"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  compact?: boolean;
  /**
   * Numeric value (not formatted)
   */
  value?: number | null;
  /**
   * Currency code
   * @default "INR"
   */
  currency?: Currency;
  /**
   * Callback when value changes
   */
  onChange?: (value: number | null, currency: Currency) => void;
  /**
   * Callback when currency changes
   */
  onCurrencyChange?: (currency: Currency) => void;
  /**
   * Show currency selector dropdown
   * @default false
   */
  showCurrencySelector?: boolean;
  /**
   * Enable auto-formatting on blur
   * @default true
   */
  autoFormat?: boolean;
  /**
   * Allow negative values
   * @default false
   */
  allowNegative?: boolean;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
}

export const FormCurrencyInput = forwardRef<
  HTMLInputElement,
  FormCurrencyInputProps
>(
  (
    {
      label,
      error,
      helperText,
      className,
      fullWidth = true,
      compact = false,
      id,
      value,
      currency = "INR",
      onChange,
      onCurrencyChange,
      showCurrencySelector = false,
      autoFormat = true,
      allowNegative = false,
      min,
      max,
      disabled,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] =
      useState<Currency>(currency);
    const [inputValue, setInputValue] = useState(
      value != null ? String(value) : ""
    );
    const [isFocused, setIsFocused] = useState(false);

    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(error);

    const currencyConfig =
      CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

    const handleCurrencySelect = (code: Currency) => {
      setSelectedCurrency(code);
      setIsOpen(false);
      onCurrencyChange?.(code);

      // Parse current value and trigger onChange with new currency
      const numValue = parseValue(inputValue);
      onChange?.(numValue, code);
    };

    const parseValue = (val: string): number | null => {
      if (!val || val === "-") return null;

      // Remove currency symbols, commas, and whitespace
      const cleaned = val.replace(/[₹$€£,\s]/g, "");

      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Allow only digits, decimal point, minus sign, and commas
      newValue = newValue.replace(/[^\d.,-]/g, "");

      // Handle negative sign
      if (!allowNegative) {
        newValue = newValue.replace(/-/g, "");
      } else {
        // Only allow minus at the beginning
        const minusCount = (newValue.match(/-/g) || []).length;
        if (minusCount > 1 || (newValue.indexOf("-") > 0 && minusCount > 0)) {
          newValue = newValue.replace(/-/g, "");
        }
      }

      // Only allow one decimal point
      const decimalCount = (newValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        const parts = newValue.split(".");
        newValue = parts[0] + "." + parts.slice(1).join("");
      }

      setInputValue(newValue);

      // Parse and validate
      const numValue = parseValue(newValue);

      // Apply min/max validation
      let validatedValue = numValue;
      if (numValue != null) {
        if (min != null && numValue < min) {
          validatedValue = min;
        }
        if (max != null && numValue > max) {
          validatedValue = max;
        }
      }

      onChange?.(validatedValue, selectedCurrency);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      let processedValue = inputValue;
      const numValue = parseValue(processedValue);

      // Auto-format on blur
      if (autoFormat && numValue != null) {
        // Format without symbol for input display
        processedValue = numValue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setInputValue(processedValue);
      }

      onBlur?.(e);
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Remove formatting on focus for easier editing
      const numValue = parseValue(inputValue);
      if (numValue != null) {
        setInputValue(String(numValue));
      }
    };

    // Get formatted display value
    const getFormattedValue = () => {
      const numValue = parseValue(inputValue);
      if (numValue == null) return "";
      return formatPrice(numValue, { currency: selectedCurrency });
    };

    return (
      <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1.5 text-sm font-medium text-gray-700",
              hasError && "text-red-600",
              compact && "mb-1 text-xs"
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex">
          {/* Currency Symbol/Selector */}
          {showCurrencySelector ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 border border-r-0 rounded-l-lg bg-gray-50",
                  "hover:bg-gray-100 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
                  hasError && "border-red-300",
                  disabled && "opacity-50 cursor-not-allowed",
                  compact && "py-1.5 text-sm"
                )}
              >
                <span className="text-sm font-medium text-gray-700">
                  {currencyConfig.symbol}
                </span>
                <svg
                  className={cn(
                    "w-4 h-4 text-gray-500 transition-transform",
                    isOpen && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Dropdown Menu */}
                  <div className="absolute z-20 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => handleCurrencySelect(curr.code)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
                          selectedCurrency === curr.code && "bg-blue-50"
                        )}
                      >
                        <span className="text-lg font-medium">
                          {curr.symbol}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {curr.code}
                          </div>
                          <div className="text-xs text-gray-500">
                            {curr.name}
                          </div>
                        </div>
                        {selectedCurrency === curr.code && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center px-3 border border-r-0 rounded-l-lg bg-gray-50",
                hasError && "border-red-300",
                compact && "text-sm"
              )}
            >
              <span className="text-sm font-medium text-gray-700">
                {currencyConfig.symbol}
              </span>
            </div>
          )}

          {/* Currency Input */}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            id={inputId}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={disabled}
            className={cn(
              "flex-1 px-4 py-2.5 border rounded-r-lg",
              "bg-white text-gray-900 placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
              "transition-colors",
              hasError &&
                "border-red-300 focus:ring-red-500 focus:border-red-300",
              !hasError && "border-gray-300",
              compact && "py-1.5 text-sm"
            )}
            placeholder="0.00"
            {...props}
          />
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <p
            className={cn(
              "mt-1.5 text-sm",
              hasError ? "text-red-600" : "text-gray-500",
              compact && "mt-1 text-xs"
            )}
          >
            {error || helperText}
          </p>
        )}

        {/* Formatted Preview */}
        {inputValue && !hasError && !isFocused && (
          <p className="mt-1 text-xs text-gray-500">
            Formatted: {getFormattedValue()}
          </p>
        )}

        {/* Min/Max Hint */}
        {(min != null || max != null) && !hasError && (
          <p className="mt-1 text-xs text-gray-500">
            {min != null && max != null
              ? `Range: ${formatPrice(min, {
                  currency: selectedCurrency,
                })} - ${formatPrice(max, { currency: selectedCurrency })}`
              : min != null
              ? `Min: ${formatPrice(min, { currency: selectedCurrency })}`
              : `Max: ${formatPrice(max, { currency: selectedCurrency })}`}
          </p>
        )}
      </div>
    );
  }
);

FormCurrencyInput.displayName = "FormCurrencyInput";
