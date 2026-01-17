"use client";

/**
 * MobileInput Component
 *
 * Framework-agnostic mobile number input with country code picker.
 * Supports validation and formatting.
 *
 * @example
 * ```tsx
 * <MobileInput
 *   value={phone}
 *   onChange={setPhone}
 *   countryCode="+91"
 *   label="Mobile Number"
 * />
 * ```
 */

import React, { forwardRef, useState } from "react";

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  maxLength: number;
}

export interface MobileInputProps {
  /** Phone number value (digits only) */
  value: string;
  /** Change callback */
  onChange: (value: string) => void;
  /** Country code (e.g., "+91") */
  countryCode?: string;
  /** Country code change callback */
  onCountryCodeChange?: (code: string) => void;
  /** Available country codes */
  countryCodes?: CountryCode[];
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Field label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Input CSS classes */
  inputClassName?: string;
  /** Input ID */
  id?: string;
  /** Input name */
  name?: string;
  /** Custom ChevronDown icon */
  ChevronDownIcon?: React.ComponentType<{ className?: string }>;
}

// Default country codes
const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  { code: "+91", name: "India", flag: "🇮🇳", maxLength: 10 },
  { code: "+1", name: "USA", flag: "🇺🇸", maxLength: 10 },
  { code: "+44", name: "UK", flag: "🇬🇧", maxLength: 10 },
  { code: "+971", name: "UAE", flag: "🇦🇪", maxLength: 9 },
];

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icon
function DefaultChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  function MobileInput(
    {
      value,
      onChange,
      countryCode = "+91",
      onCountryCodeChange,
      countryCodes = DEFAULT_COUNTRY_CODES,
      disabled = false,
      required = false,
      error,
      label = "Mobile Number",
      placeholder = "9876543210",
      className = "",
      inputClassName = "",
      id,
      name,
      ChevronDownIcon = DefaultChevronDownIcon,
    },
    ref
  ) {
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const selectedCountry =
      countryCodes.find((c) => c.code === countryCode) || countryCodes[0];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
        .replace(/\D/g, "")
        .slice(0, selectedCountry.maxLength);
      onChange(newValue);
    };

    const handleCountrySelect = (code: string) => {
      onCountryCodeChange?.(code);
      setShowCountryPicker(false);
    };

    const inputId = id || name || "mobile-input";

    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="flex gap-2">
          {/* Country code picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                !disabled && setShowCountryPicker(!showCountryPicker)
              }
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "border border-gray-300 dark:border-gray-600",
                "bg-white dark:bg-gray-800",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "transition-colors",
                disabled && "opacity-50 cursor-not-allowed",
                error && "border-red-500"
              )}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">
                {selectedCountry.code}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {/* Country picker dropdown */}
            {showCountryPicker && !disabled && (
              <div className="absolute top-full mt-1 left-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[200px]">
                {countryCodes.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      "transition-colors",
                      country.code === countryCode &&
                        "bg-gray-50 dark:bg-gray-700/50"
                    )}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {country.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone number input */}
          <input
            ref={ref}
            type="tel"
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg",
              "border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "transition-colors",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500 focus:ring-red-500",
              inputClassName
            )}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Validation status */}
        {!error && value.length === selectedCountry.maxLength && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ✓ Valid phone number
          </p>
        )}
      </div>
    );
  }
);

export default MobileInput;
