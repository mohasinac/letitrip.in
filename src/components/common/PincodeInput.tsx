"use client";

import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { Loader2, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { locationService } from "@/services/location.service";
import type { PincodeLookupResult } from "@/types/shared/location.types";
import { PINCODE_LENGTH } from "@/constants/location";

export interface PincodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onLookupComplete?: (result: PincodeLookupResult) => void;
  onAreaSelect?: (area: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoLookup?: boolean;
  showAreaSelector?: boolean;
  id?: string;
  name?: string;
}

export const PincodeInput = forwardRef<HTMLInputElement, PincodeInputProps>(
  function PincodeInput(
    {
      value,
      onChange,
      onLookupComplete,
      onAreaSelect,
      disabled = false,
      required = false,
      error,
      label = "Pincode",
      placeholder = "Enter 6-digit pincode",
      className = "",
      inputClassName = "",
      autoLookup = true,
      showAreaSelector = true,
      id,
      name,
    },
    ref
  ) {
    const [loading, setLoading] = useState(false);
    const [lookupResult, setLookupResult] =
      useState<PincodeLookupResult | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<string>("");
    const [lastLookedUp, setLastLookedUp] = useState<string>("");

    // Auto-lookup when pincode is complete
    const performLookup = useCallback(
      async (pincode: string) => {
        if (pincode === lastLookedUp) return;
        if (!locationService.isValidPincode(pincode)) return;

        setLoading(true);
        setLookupError(null);

        try {
          const result = await locationService.lookupPincode(pincode);
          setLookupResult(result);
          setLastLookedUp(pincode);

          if (result.isValid) {
            // Auto-select first area if only one
            if (result.areas.length === 1) {
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
      },
      [lastLookedUp, onAreaSelect, onLookupComplete]
    );

    // Trigger lookup when value reaches 6 digits
    useEffect(() => {
      if (autoLookup && value.length === PINCODE_LENGTH) {
        performLookup(value);
      }
    }, [value, autoLookup, performLookup]);

    // Clear result when value changes significantly
    useEffect(() => {
      if (value.length < PINCODE_LENGTH && lookupResult) {
        setLookupResult(null);
        setLookupError(null);
        setSelectedArea("");
      }
    }, [value, lookupResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
        .replace(/\D/g, "")
        .slice(0, PINCODE_LENGTH);
      onChange(newValue);
    };

    const handleAreaSelect = (area: string) => {
      setSelectedArea(area);
      onAreaSelect?.(area);
    };

    const getStatusIcon = () => {
      if (loading) {
        return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
      }
      if (lookupError || error) {
        return <XCircle className="w-4 h-4 text-red-500" />;
      }
      if (lookupResult?.isValid) {
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      }
      return <MapPin className="w-4 h-4 text-gray-400" />;
    };

    const inputId = id || name || "pincode-input";

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled || loading}
            placeholder={placeholder}
            maxLength={PINCODE_LENGTH}
            className={`
              w-full px-3 py-2 pr-10
              border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/50
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${
                error || lookupError
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }
              ${lookupResult?.isValid ? "border-green-500" : ""}
              dark:bg-gray-800 dark:text-white
              ${inputClassName}
            `}
            aria-invalid={!!(error || lookupError)}
            aria-describedby={
              error || lookupError ? `${inputId}-error` : undefined
            }
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getStatusIcon()}
          </div>
        </div>

        {/* Error message */}
        {(error || lookupError) && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error || lookupError}
          </p>
        )}

        {/* Lookup result */}
        {lookupResult?.isValid && !error && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <p>
              <span className="font-medium">{lookupResult.city}</span>
              {lookupResult.district !== lookupResult.city && (
                <span>, {lookupResult.district}</span>
              )}
              <span>, {lookupResult.state}</span>
            </p>
          </div>
        )}

        {/* Area selector for multiple areas */}
        {showAreaSelector &&
          lookupResult?.isValid &&
          lookupResult.hasMultipleAreas &&
          lookupResult.areas.length > 1 && (
            <div className="mt-2">
              <label
                htmlFor="pincode-area-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select Area
              </label>
              <select
                id="pincode-area-select"
                value={selectedArea}
                onChange={(e) => handleAreaSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary/50
                         dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select an area...</option>
                {lookupResult.areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          )}
      </div>
    );
  }
);

export default PincodeInput;
