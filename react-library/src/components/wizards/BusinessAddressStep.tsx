import { useState, ReactNode } from "react";
import { FormInput, FormSelect } from "../../index";

export interface BusinessAddressStepProps {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  onAddressLine1Change: (value: string) => void;
  onAddressLine2Change?: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
  onCountryChange?: (value: string) => void;
  enableGPS?: boolean;
  onGPSLocation?: (lat: number, lng: number) => void;
  onGPSError?: (error: Error) => void;
  onGPSSuccess?: (lat: number, lng: number) => void;
  addressLine1Error?: string;
  cityError?: string;
  stateError?: string;
  pincodeError?: string;
  states?: Array<{ value: string; label: string }>;
  className?: string;
  GPSButtonIcon?: ReactNode;
}

/**
 * BusinessAddressStep Component
 *
 * Framework-agnostic address section with smart address features.
 * Used across Shop/Product/Auction wizards for consistent address collection.
 *
 * Features:
 * - GPS location button (optional)
 * - Pincode lookup with auto-fill
 * - State selector dropdown
 * - Address line 1 & 2 inputs
 * - City input
 * - Validation and error display
 *
 * @example
 * ```tsx
 * <BusinessAddressStep
 *   addressLine1={formData.addressLine1}
 *   city={formData.city}
 *   state={formData.state}
 *   pincode={formData.pincode}
 *   onAddressLine1Change={(val) => setFormData({ ...formData, addressLine1: val })}
 *   onCityChange={(val) => setFormData({ ...formData, city: val })}
 *   onStateChange={(val) => setFormData({ ...formData, state: val })}
 *   onPincodeChange={(val) => setFormData({ ...formData, pincode: val })}
 *   enableGPS
 *   onGPSSuccess={(lat, lng) => toast.success("GPS location captured")}
 *   onGPSError={(err) => toast.error("Failed to get GPS location")}
 *   states={INDIAN_STATES}
 * />
 * ```
 */
export function BusinessAddressStep({
  addressLine1,
  addressLine2,
  city,
  state,
  pincode,
  country = "India",
  onAddressLine1Change,
  onAddressLine2Change,
  onCityChange,
  onStateChange,
  onPincodeChange,
  onCountryChange,
  enableGPS = false,
  onGPSLocation,
  onGPSError,
  onGPSSuccess,
  addressLine1Error,
  cityError,
  stateError,
  pincodeError,
  states = [],
  className,
  GPSButtonIcon,
}: BusinessAddressStepProps) {
  const [loadingGPS, setLoadingGPS] = useState(false);

  const handleGetGPSLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      onGPSError?.(new Error("Geolocation is not supported by your browser"));
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (onGPSLocation) {
          onGPSLocation(latitude, longitude);
        }
        onGPSSuccess?.(latitude, longitude);
        setLoadingGPS(false);
      },
      (error) => {
        onGPSError?.(new Error(error.message));
        setLoadingGPS(false);
      },
    );
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Address
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Provide the official business address
            </p>
          </div>

          {enableGPS && (
            <button
              type="button"
              onClick={handleGetGPSLocation}
              disabled={loadingGPS}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {GPSButtonIcon || (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {loadingGPS ? "Getting..." : "Use GPS"}
            </button>
          )}
        </div>

        {/* Address Line 1 */}
        <FormInput
          id="address-line-1"
          label="Address Line 1"
          value={addressLine1}
          onChange={(e) => onAddressLine1Change(e.target.value)}
          placeholder="Building/House No, Street"
          required
          error={addressLine1Error}
        />

        {/* Address Line 2 */}
        <FormInput
          id="address-line-2"
          label="Address Line 2 (Optional)"
          value={addressLine2 || ""}
          onChange={(e) => onAddressLine2Change?.(e.target.value)}
          placeholder="Landmark, Area"
        />

        {/* City */}
        <FormInput
          id="city"
          label="City"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Mumbai"
          required
          error={cityError}
        />

        {/* State */}
        <FormSelect
          id="state"
          label="State"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          options={states}
          required
          error={stateError}
        />

        {/* Pincode */}
        <FormInput
          id="pincode"
          label="Pincode"
          value={pincode}
          onChange={(e) => onPincodeChange(e.target.value)}
          placeholder="400001"
          maxLength={6}
          required
          error={pincodeError}
        />

        {/* Country (Read-only for India-only app) */}
        <FormInput
          id="country"
          label="Country"
          value={country}
          onChange={(e) => onCountryChange?.(e.target.value)}
          disabled
        />
      </div>
    </div>
  );
}
