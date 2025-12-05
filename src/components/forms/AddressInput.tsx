"use client";

/**
 * AddressInput Component
 *
 * @status IMPLEMENTED
 * @task 1.2.3
 *
 * Smart address input component with:
 * - PIN code / postal code lookup
 * - Auto-fill city, state, country
 * - City autocomplete
 * - International address support
 * - Mobile responsive
 * - Dark mode support
 */

import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { INDIAN_STATES } from "@/config/address-api.config";
import { useDebounce } from "@/hooks/useDebounce";
import { logError } from "@/lib/firebase-error-logger";
import { addressService } from "@/services/address.service";
import { AlertCircle, CheckCircle, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface AddressInputValue {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
}

export interface AddressInputProps {
  value: AddressInputValue;
  onChange: (value: AddressInputValue) => void;
  errors?: Partial<Record<keyof AddressInputValue, string>>;
  required?: boolean;
  disabled?: boolean;
  showLandmark?: boolean;
  defaultCountry?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AddressInput({
  value,
  onChange,
  errors = {},
  required = false,
  disabled = false,
  showLandmark = true,
  defaultCountry = "India",
}: AddressInputProps) {
  const [lookingUpPincode, setLookingUpPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Debounce postal code for lookup
  const debouncedPostalCode = useDebounce(value.postalCode, 500);

  // Debounce city input for autocomplete
  const debouncedCity = useDebounce(value.city, 300);

  /**
   * Lookup PIN code details (India only for now)
   */
  useEffect(() => {
    if (
      value.country === "India" &&
      debouncedPostalCode &&
      debouncedPostalCode.length === 6 &&
      /^\d{6}$/.test(debouncedPostalCode)
    ) {
      lookupPincode(debouncedPostalCode);
    }
  }, [debouncedPostalCode, value.country]);

  /**
   * Autocomplete city names
   */
  useEffect(() => {
    if (debouncedCity && debouncedCity.length >= 2) {
      loadCitySuggestions(debouncedCity);
    } else {
      setCities([]);
    }
  }, [debouncedCity, value.state, value.country]);

  const lookupPincode = async (pincode: string) => {
    try {
      setLookingUpPincode(true);
      setPincodeStatus("loading");

      const details = await addressService.lookupPincode(pincode);

      if (details) {
        // Auto-fill city, state from PIN code
        onChange({
          ...value,
          city: details.city,
          state: details.state,
          country: details.country,
        });
        setPincodeStatus("success");
      } else {
        setPincodeStatus("error");
      }
    } catch (error) {
      logError(error as Error, {
        component: "AddressInput.lookupPincode",
        pincode,
      });
      setPincodeStatus("error");
    } finally {
      setLookingUpPincode(false);
      setTimeout(() => setPincodeStatus("idle"), 3000);
    }
  };

  const loadCitySuggestions = async (query: string) => {
    try {
      setLoadingCities(true);

      const results = await addressService.autocompleteCities({
        query,
        state: value.state,
        country: value.country,
        limit: 5,
      });

      setCities(results.map((r) => r.city));
    } catch (error) {
      logError(error as Error, {
        component: "AddressInput.loadCitySuggestions",
        query,
      });
    } finally {
      setLoadingCities(false);
    }
  };

  const handleFieldChange = (
    field: keyof AddressInputValue,
    fieldValue: string
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const getPostalCodeLabel = () => {
    if (value.country === "India") return "PIN Code";
    if (value.country === "United States") return "ZIP Code";
    return "Postal Code";
  };

  const getPostalCodePlaceholder = () => {
    if (value.country === "India") return "110001";
    if (value.country === "United States") return "90210";
    if (value.country === "United Kingdom") return "SW1A 1AA";
    return "Enter postal code";
  };

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <FormField label="Country" required={required} error={errors.country}>
        <FormSelect
          value={value.country}
          onChange={(e) => handleFieldChange("country", e.target.value)}
          disabled={disabled}
          required={required}
          options={[
            { value: "", label: "Select Country" },
            { value: "India", label: "India" },
            { value: "United States", label: "United States" },
            { value: "United Kingdom", label: "United Kingdom" },
            { value: "Canada", label: "Canada" },
            { value: "Australia", label: "Australia" },
            { value: "Singapore", label: "Singapore" },
          ]}
        />
      </FormField>

      {/* Postal Code with Lookup */}
      <FormField
        label={getPostalCodeLabel()}
        required={required}
        error={errors.postalCode}
      >
        <div className="relative">
          <FormInput
            value={value.postalCode}
            onChange={(e) => handleFieldChange("postalCode", e.target.value)}
            placeholder={getPostalCodePlaceholder()}
            disabled={disabled}
            required={required}
            maxLength={value.country === "India" ? 6 : 10}
            rightIcon={
              pincodeStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
              ) : pincodeStatus === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              ) : pincodeStatus === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
              ) : (
                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              )
            }
          />
          {pincodeStatus === "success" && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              Address details auto-filled
            </p>
          )}
          {pincodeStatus === "error" && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Invalid postal code or lookup failed
            </p>
          )}
        </div>
      </FormField>

      {/* Address Line 1 */}
      <FormField
        label="Address Line 1"
        required={required}
        error={errors.line1}
      >
        <FormInput
          value={value.line1}
          onChange={(e) => handleFieldChange("line1", e.target.value)}
          placeholder="House No., Building Name, Street"
          disabled={disabled}
          required={required}
          maxLength={100}
        />
      </FormField>

      {/* Address Line 2 (Optional) */}
      <FormField label="Address Line 2 (Optional)" error={errors.line2}>
        <FormInput
          value={value.line2 || ""}
          onChange={(e) => handleFieldChange("line2", e.target.value)}
          placeholder="Apartment, Suite, Floor"
          disabled={disabled}
          maxLength={100}
        />
      </FormField>

      {/* Landmark (Optional) */}
      {showLandmark && (
        <FormField label="Landmark (Optional)" error={errors.landmark}>
          <FormInput
            value={value.landmark || ""}
            onChange={(e) => handleFieldChange("landmark", e.target.value)}
            placeholder="Near Hospital, Temple, etc."
            disabled={disabled}
            maxLength={100}
          />
        </FormField>
      )}

      {/* City with Autocomplete */}
      <FormField label="City" required={required} error={errors.city}>
        <div className="relative">
          <FormInput
            value={value.city}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            placeholder="Enter city name"
            disabled={disabled}
            required={required}
            rightIcon={
              loadingCities ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
              ) : undefined
            }
          />

          {/* City Suggestions Dropdown */}
          {cities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {cities.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    handleFieldChange("city", city);
                    setCities([]);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </FormField>

      {/* State */}
      <FormField
        label="State / Province"
        required={required}
        error={errors.state}
      >
        {value.country === "India" ? (
          <FormSelect
            value={value.state}
            onChange={(e) => handleFieldChange("state", e.target.value)}
            disabled={disabled}
            required={required}
            options={[
              { value: "", label: "Select State" },
              ...INDIAN_STATES.map((state) => ({
                value: state.name,
                label: state.name,
              })),
            ]}
          />
        ) : (
          <FormInput
            value={value.state}
            onChange={(e) => handleFieldChange("state", e.target.value)}
            placeholder="Enter state or province"
            disabled={disabled}
            required={required}
            maxLength={50}
          />
        )}
      </FormField>
    </div>
  );
}
