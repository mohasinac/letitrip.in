"use client";

/**
 * PincodeInput Component
 *
 * Framework-agnostic pincode input with validation and optional lookup.
 * Supports 6-digit Indian pincodes with area selection.
 *
 * @example
 * ```tsx
 * const [pincode, setPincode] = useState('');
 * const [area, setArea] = useState('');
 *
 * <PincodeInput
 *   label="Pincode"
 *   value={pincode}
 *   onChange={setPincode}
 *   onLookup={async (pin) => {
 *     const result = await api.lookupPincode(pin);
 *     return result;
 *   }}
 *   onAreaSelect={setArea}
 *   showAreaSelector
 * />
 * ```
 */

import { useEffect, useState } from "react";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Spinner icon
const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Check icon
const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// X icon
const XIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// MapPin icon
const MapPinIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export interface PincodeLookupResult {
  isValid: boolean;
  city?: string;
  state?: string;
  areas?: string[];
}

export interface PincodeInputProps {
  /** Label text displayed above the input */
  label?: string;
  /** Current pincode value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Async function to lookup pincode details */
  onLookup?: (pincode: string) => Promise<PincodeLookupResult>;
  /** Callback when lookup completes */
  onLookupComplete?: (result: PincodeLookupResult) => void;
  /** Callback when area is selected */
  onAreaSelect?: (area: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Placeholder text (default: "Enter 6-digit pincode") */
  placeholder?: string;
  /** Auto-lookup when 6 digits entered (default: true) */
  autoLookup?: boolean;
  /** Show area selector dropdown (default: true) */
  showAreaSelector?: boolean;
  /** Custom icon components */
  SpinnerIconComponent?: React.ComponentType;
  CheckIconComponent?: React.ComponentType;
  XIconComponent?: React.ComponentType;
  MapPinIconComponent?: React.ComponentType;
}

const PINCODE_LENGTH = 6;

export function PincodeInput({
  label = "Pincode",
  value,
  onChange,
  onLookup,
  onLookupComplete,
  onAreaSelect,
  disabled,
  required,
  error,
  helperText,
  placeholder = "Enter 6-digit pincode",
  autoLookup = true,
  showAreaSelector = true,
  SpinnerIconComponent = SpinnerIcon,
  CheckIconComponent = CheckIcon,
  XIconComponent = XIcon,
  MapPinIconComponent = MapPinIcon,
}: PincodeInputProps) {
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<PincodeLookupResult | null>(
    null
  );
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [lastLookedUp, setLastLookedUp] = useState<string>("");

  // Validate pincode format
  const isValidFormat = (pin: string) => /^\d{6}$/.test(pin);

  // Perform lookup
  const performLookup = async (pincode: string) => {
    if (!onLookup || pincode === lastLookedUp) return;
    if (!isValidFormat(pincode)) return;

    setLoading(true);
    setLookupError(null);

    try {
      const result = await onLookup(pincode);
      setLookupResult(result);
      setLastLookedUp(pincode);

      if (result.isValid) {
        // Auto-select first area if only one
        if (result.areas && result.areas.length === 1) {
          setSelectedArea(result.areas[0]);
          onAreaSelect?.(result.areas[0]);
        }
        onLookupComplete?.(result);
      } else {
        setLookupError("Invalid pincode. Please check and try again.");
      }
    } catch (err) {
      setLookupError("Failed to lookup pincode. Please try again.");
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup when complete
  useEffect(() => {
    if (autoLookup && value.length === PINCODE_LENGTH) {
      performLookup(value);
    }
  }, [value, autoLookup]);

  // Clear result when value changes
  useEffect(() => {
    if (value.length < PINCODE_LENGTH && lookupResult) {
      setLookupResult(null);
      setLookupError(null);
      setSelectedArea("");
    }
  }, [value, lookupResult]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, "").slice(0, PINCODE_LENGTH);
    onChange(newValue);
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    onAreaSelect?.(area);
  };

  const getStatusIcon = () => {
    if (loading) return <SpinnerIconComponent />;
    if (lookupError || error) return <XIconComponent />;
    if (lookupResult?.isValid) return <CheckIconComponent />;
    return <MapPinIconComponent />;
  };

  const displayError = error || lookupError;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border px-3 py-2 pr-10 text-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2",
            displayError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            disabled &&
              "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60"
          )}
        />

        {/* Status icon */}
        <div
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            loading && "text-gray-400 dark:text-gray-500",
            !!displayError && "text-red-500 dark:text-red-400",
            lookupResult?.isValid && "text-green-500 dark:text-green-400",
            !loading &&
              !displayError &&
              !lookupResult &&
              "text-gray-400 dark:text-gray-500"
          )}
        >
          {getStatusIcon()}
        </div>
      </div>

      {/* Lookup result */}
      {lookupResult?.isValid && (lookupResult.city || lookupResult.state) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {lookupResult.city && lookupResult.state && (
            <span>
              {lookupResult.city}, {lookupResult.state}
            </span>
          )}
        </div>
      )}

      {/* Area selector */}
      {showAreaSelector &&
        lookupResult?.isValid &&
        lookupResult.areas &&
        lookupResult.areas.length > 1 && (
          <select
            value={selectedArea}
            onChange={(e) => handleAreaSelect(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200",
              "focus:outline-none focus:ring-2",
              "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              disabled &&
                "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60"
            )}
          >
            <option value="">Select Area</option>
            {lookupResult.areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        )}

      {/* Helper text / Error */}
      {displayError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {displayError}
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
}

export default PincodeInput;
