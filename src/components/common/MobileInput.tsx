"use client";

import React, { useState, forwardRef } from "react";
import { ChevronDown, Phone, MessageCircle } from "lucide-react";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  isValidIndianPhone,
  PHONE_LENGTH,
} from "@/constants/location";
import { locationService } from "@/services/location.service";
import { FormLabel } from "@/components/forms";

export interface MobileInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showActions?: boolean;
  id?: string;
  name?: string;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  function MobileInput(
    {
      value,
      onChange,
      countryCode = DEFAULT_COUNTRY_CODE,
      onCountryCodeChange,
      disabled = false,
      required = false,
      error,
      label = "Mobile Number",
      placeholder = "9876543210",
      className = "",
      inputClassName = "",
      showActions = false,
      id,
      name,
    },
    ref
  ) {
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const selectedCountry =
      COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
    const isValid = value.length === PHONE_LENGTH && isValidIndianPhone(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
      onChange(newValue);
    };

    const handleCountrySelect = (code: string) => {
      onCountryCodeChange?.(code);
      setShowCountryPicker(false);
    };

    const inputId = id || name || "mobile-input";

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <FormLabel htmlFor={inputId} required={required}>
            {label}
          </FormLabel>
        )}

        <div className="flex">
          {/* Country code picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                !disabled && setShowCountryPicker(!showCountryPicker)
              }
              disabled={disabled}
              className={`
                flex items-center gap-1 px-3 py-2
                border border-r-0 rounded-l-lg
                bg-gray-50 dark:bg-gray-700
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100 dark:hover:bg-gray-600"
                }
                ${
                  error
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }
              `}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedCountry.code}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Country dropdown */}
            {showCountryPicker && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCountryPicker(false)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setShowCountryPicker(false)
                  }
                  role="button"
                  tabIndex={-1}
                  aria-label="Close country picker"
                />
                <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px] max-h-60 overflow-y-auto">
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={`${country.iso}-${country.code}`}
                      type="button"
                      onClick={() => handleCountrySelect(country.code)}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 text-left
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${country.code === countryCode ? "bg-primary/10" : ""}
                      `}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {country.country}
                      </span>
                      <span className="text-sm text-gray-500 ml-auto">
                        {country.code}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Phone input */}
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={PHONE_LENGTH}
            className={`
              flex-1 px-3 py-2
              border rounded-r-lg
              focus:outline-none focus:ring-2 focus:ring-primary/50
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${
                error
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }
              dark:bg-gray-800 dark:text-white
              ${inputClassName}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Action buttons */}
        {showActions && isValid && (
          <div className="flex gap-2 mt-2">
            <a
              href={locationService.getTelLink(value, countryCode)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm
                       bg-green-100 text-green-700 rounded-lg
                       hover:bg-green-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
            <a
              href={locationService.getWhatsAppLink(value, countryCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm
                       bg-green-500 text-white rounded-lg
                       hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    );
  }
);

export default MobileInput;
