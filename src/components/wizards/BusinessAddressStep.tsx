/**
 * @fileoverview React Component
 * @module src/components/wizards/BusinessAddressStep
 * @description This file contains the BusinessAddressStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { INDIAN_STATES } from "@/constants/location";

/**
 * BusinessAddressStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BusinessAddressStepProps
 */
export interface BusinessAddressStepProps {
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2?: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Pincode */
  pincode: string;
  /** Country */
  country?: string;
  /** On Address Line1 Change */
  onAddressLine1Change: (value: string) => void;
  /** On Address Line2 Change */
  onAddressLine2Change?: (value: string) => void;
  /** On City Change */
  onCityChange: (value: string) => void;
  /** On State Change */
  onStateChange: (value: string) => void;
  /** On Pincode Change */
  onPincodeChange: (value: string) => void;
  /** On Country Change */
  onCountryChange?: (value: string) => void;
  /** Enable G P S */
  enableGPS?: boolean;
  /** On G P S Location */
  onGPSLocation?: (lat: number, lng: number) => void;
  /** Address Line1 Error */
  addressLine1Error?: string;
  /** City Error */
  cityError?: string;
  /** State Error */
  stateError?: string;
  /** Pincode Error */
  pincodeError?: string;
}

/**
 * BusinessAddressStep Component
 *
 * Reusable address section with smart address features.
 * Used across Shop/Product/Auction wizards for consistent address collection.
 *
 * Features:
 * - GPS location button (optional)
 * - Pincode lookup with auto-fill
 * - Indian state selector dropdown
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
 * />
 * ```
 */
/**
 * Performs business address step operation
 *
 * @returns {any} The businessaddressstep result
 *
 * @example
 * BusinessAddressStep();
 */

/**
 * Performs business address step operation
 *
 * @returns {any} The businessaddressstep result
 *
 * @example
 * BusinessAddressStep();
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
  addressLine1Error,
  cityError,
  stateError,
  pincodeError,
}: BusinessAddressStepProps) {
  const [loadingGPS, setLoadingGPS] = useState(false);

  /**
   * Handles get g p s location event
   *
   * @returns {any} The handlegetgpslocation result
   */

  /**
   * Handles get g p s location event
   *
   * @returns {any} The handlegetgpslocation result
   */

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (onGPSLocation) {
          onGPSLocation(latitude, longitude);
        }
        toast.success("GPS location captured");
        setLoadingGPS(false);
      },
      (error) => {
        logError(error as any, {
          /** Component */
          component: "BusinessAddressStep.getCurrentLocation",
        });
        toast.error("Failed to get GPS location");
        setLoadingGPS(false);
      },
    );
  };

  return (
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

        {enableGPS && onGPSLocation && (
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={loadingGPS}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <MapPin className="w-4 h-4" />
            {loadingGPS ? "Getting location..." : "Use GPS"}
          </button>
        )}
      </div>

      {/* Address Line 1 */}
      <FormInput
        id="address-line-1"
        label="Address Line 1"
        value={addressLine1}
        onChange={(e) => onAddressLine1Change(e.target.value)}
        placeholder="Building name, street, area"
        required
        error={addressLine1Error}
      />

      {/* Address Line 2 */}
      {onAddressLine2Change && (
        <FormInput
          id="address-line-2"
          label="Address Line 2"
          value={addressLine2 || ""}
          onChange={(e) => onAddressLine2Change(e.target.value)}
          placeholder="Landmark, nearby location (optional)"
        />
      )}

      {/* City and Pincode Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="city"
          label="City"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="e.g., Mumbai"
          required
          error={cityError}
        />

        <FormInput
          id="pincode"
          label="Pincode"
          value={pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            onPincodeChange(value);
          }}
          placeholder="400001"
          maxLength={6}
          required
          error={pincodeError}
          helperText="6-digit postal code"
        />
      </div>

      {/* State and Country Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          id="state"
          label="State"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          options={[
            { value: "", label: "Select state" },
            ...INDIAN_STATES.map((s) => ({ value: s, label: s })),
          ]}
          required
          error={stateError}
        />

        <FormInput
          id="country"
          label="Country"
          value={country}
          onChange={(e) => onCountryChange?.(e.target.value)}
          disabled={!onCountryChange}
          placeholder="India"
        />
      </div>
    </div>
  );
}

export default BusinessAddressStep;
