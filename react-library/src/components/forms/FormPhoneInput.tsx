
import { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "../../utils/cn";
import { formatPhoneNumber } from "../../utils/formatters";
import { sanitizePhone } from "../../utils/sanitize";

// Common country codes for Indian platform
const COUNTRY_CODES = [
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳" },
  { code: "+1", country: "US", name: "United States", flag: "🇺🇸" },
  { code: "+44", country: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "+971", country: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳" },
] as const;

export interface FormPhoneInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  compact?: boolean;
  /**
   * Phone number value (without country code)
   */
  value?: string;
  /**
   * Selected country code
   * @default "+91"
   */
  countryCode?: string;
  /**
   * Callback when phone number changes
   */
  onChange?: (phone: string, countryCode: string) => void;
  /**
   * Callback when country code changes
   */
  onCountryCodeChange?: (countryCode: string) => void;
  /**
   * Enable auto-formatting on blur
   * @default true
   */
  autoFormat?: boolean;
  /**
   * Show country code selector
   * @default true
   */
  showCountrySelector?: boolean;
  /**
   * Enable sanitization on blur
   * @default true
   */
  sanitize?: boolean;
}

export const FormPhoneInput = forwardRef<HTMLInputElement, FormPhoneInputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      fullWidth = true,
      compact = false,
      id,
      value = "",
      countryCode = "+91",
      onChange,
      onCountryCodeChange,
      autoFormat = true,
      showCountrySelector = true,
      sanitize = true,
      onBlur,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState(countryCode);
    const [phoneValue, setPhoneValue] = useState(value);

    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(error);

    const selectedCountry =
      COUNTRY_CODES.find((c) => c.code === selectedCode) || COUNTRY_CODES[0];

    const handleCountrySelect = (code: string) => {
      setSelectedCode(code);
      setIsOpen(false);
      onCountryCodeChange?.(code);
      onChange?.(phoneValue, code);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Allow only digits, spaces, hyphens, and parentheses
      newValue = newValue.replace(/[^\d\s\-()]/g, "");

      setPhoneValue(newValue);
      onChange?.(newValue, selectedCode);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let processedValue = e.target.value;

      // Sanitize
      if (sanitize) {
        processedValue = sanitizePhone(processedValue);
      }

      // Auto-format for Indian numbers
      if (autoFormat && selectedCode === "+91") {
        const cleaned = processedValue.replace(/\D/g, "");
        if (cleaned.length === 10) {
          // Format as XXXXX XXXXX
          processedValue = `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
      }

      if (processedValue !== phoneValue) {
        setPhoneValue(processedValue);
        onChange?.(processedValue, selectedCode);
      }

      onBlur?.(e);
    };

    // Get full formatted phone number for display
    const getFormattedPhone = () => {
      if (!phoneValue) return "";
      const cleaned = phoneValue.replace(/\D/g, "");
      if (selectedCode === "+91" && cleaned.length === 10) {
        return formatPhoneNumber(cleaned);
      }
      return `${selectedCode} ${phoneValue}`;
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
          {/* Country Code Selector */}
          {showCountrySelector && (
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
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm font-medium text-gray-700">
                  {selectedCountry.code}
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
                  <div className="absolute z-20 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country.code)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
                          selectedCode === country.code && "bg-blue-50"
                        )}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {country.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {country.code}
                          </div>
                        </div>
                        {selectedCode === country.code && (
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
          )}

          {/* Phone Input */}
          <input
            ref={ref}
            type="tel"
            id={inputId}
            value={phoneValue}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
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
              !showCountrySelector && "rounded-l-lg",
              compact && "py-1.5 text-sm"
            )}
            placeholder={
              selectedCode === "+91" ? "98765 43210" : "Enter phone number"
            }
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
        {phoneValue && !hasError && (
          <p className="mt-1 text-xs text-gray-500">
            Formatted: {getFormattedPhone()}
          </p>
        )}
      </div>
    );
  }
);

FormPhoneInput.displayName = "FormPhoneInput";
