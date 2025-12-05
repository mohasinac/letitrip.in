/**
 * @fileoverview React Component
 * @module src/components/common/GPSButton
 * @description This file contains the GPSButton component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { useState, useCallback } from "react";
import { MapPin, Loader2, XCircle, CheckCircle } from "lucide-react";
import { locationService } from "@/services/location.service";
import type {
  GeoCoordinates,
  GeolocationError,
  ReverseGeocodeResult,
} from "@/types/shared/location.types";

/**
 * GPSButtonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for GPSButtonProps
 */
export interface GPSButtonProps {
  /** On Location Detected */
  onLocationDetected?: (coords: GeoCoordinates) => void;
  /** On Address Detected */
  onAddressDetected?: (address: ReverseGeocodeResult) => void;
  /** On Error */
  onError?: (error: GeolocationError) => void;
  /** Disabled */
  disabled?: boolean;
  /** Class Name */
  className?: string;
  /** Variant */
  variant?: "button" | "icon" | "text";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Show Status */
  showStatus?: boolean;
  /** Reverse Geocode */
  reverseGeocode?: boolean;
}

/**
 * Status type
 * 
 * @typedef {Object} Status
 * @description Type definition for Status
 */
type Status = "idle" | "loading" | "success" | "error";

/**
 * Function: G P S Button
 */
/**
 * Performs g p s button operation
 *
 * @returns {any} The gpsbutton result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GPSButton();
 */

/**
 * Performs g p s button operation
 *
 * @returns {any} The gpsbutton result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GPSButton();
 */

export function GPSButton({
  onLocationDetected,
  onAddressDetected,
  onError,
  disabled = false,
  className = "",
  variant = "button",
  size = "md",
  showStatus = true,
  reverseGeocode = true,
}: GPSButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [permission, setPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);

  const checkPermission = useCallback(async () => {
    const result = await locationService.checkGeolocationPermission();
    setPermission(result);
    return result;
  }, []);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleClick = async () => {
    if (disabled || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      // Check permission first
      const perm = await checkPermission();
      if (perm === "denied") {
        const error: GeolocationError = {
          /** Code */
          code: "PERMISSION_DENIED",
          /** Message */
          message:
            "Location permission denied. Please enable in browser settings.",
        };
        setStatus("error");
        setErrorMessage(error.message);
        onError?.(error);
        return;
      }

      // Get current position
      const coords = await locationService.getCurrentPosition();
      onLocationDetected?.(coords);

      // Reverse geocode if requested
      if (reverseGeocode && onAddressDetected) {
        const address = await locationService.reverseGeocode(coords);
        if (address) {
          onAddressDetected(address);
        }
      }

      setStatus("success");

      // Reset to idle after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      const geoError = error as GeolocationError;
      setStatus("error");
      setErrorMessage(geoError.message || "Failed to get location");
      onError?.(geoError);
    }
  };

  /**
   * Retrieves icon
   *
   * @returns {any} The icon result
   */

  /**
   * Retrieves icon
   *
   * @returns {any} The icon result
   */

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="animate-spin" />;
      case "success":
        return <CheckCircle className="text-green-500" />;
      case "error":
        return <XCircle className="text-red-500" />;
      /** Default */
      default:
        return <MapPin />;
    }
  };

  /**
   * Retrieves size classes
   *
   * @returns {any} The sizeclasses result
   */

  /**
   * Retrieves size classes
   *
   * @returns {any} The sizeclasses result
   */

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          /** Button */
          button: "px-2 py-1 text-sm",
          /** Icon */
          icon: "w-4 h-4",
        };
      case "lg":
        return {
          /** Button */
          button: "px-4 py-3 text-lg",
          /** Icon */
          icon: "w-6 h-6",
        };
      /** Default */
      default:
        return {
          /** Button */
          button: "px-3 py-2 text-base",
          /** Icon */
          icon: "w-5 h-5",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  /**
   * Retrieves button content
   *
   * @returns {any} The buttoncontent result
   */

  /**
   * Retrieves button content
   *
   * @returns {any} The buttoncontent result
   */

  const getButtonContent = () => {
    const icon = React.cloneElement(getIcon(), {
      /** Class Name */
      className: sizeClasses.icon,
    });

    switch (variant) {
      case "icon":
        return icon;
      case "text":
        return (
          <>
            {icon}
            <span className="ml-2">
              {status === "loading"
                ? "Detecting..."
                : status === "success"
                  ? "Location found"
                  : status === "error"
                    ? "Try again"
                    : "Use my location"}
            </span>
          </>
        );
      /** Default */
      default:
        return (
          <>
            {icon}
            <span className="ml-2">
              {status === "loading" ? "Detecting..." : "Use current location"}
            </span>
          </>
        );
    }
  };

  /**
   * Retrieves button styles
   *
   * @returns {any} The buttonstyles result
   */

  /**
   * Retrieves button styles
   *
   * @returns {any} The buttonstyles result
   */

  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center
      rounded-lg font-medium
      transition-colors duration-200
      /** Focus */
      focus:outline-none focus:ring-2 focus:ring-primary/50
      /** Disabled */
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (status) {
      case "success":
        return `${baseStyles} bg-green-100 text-green-700 hover:bg-green-200`;
      case "error":
        return `${baseStyles} bg-red-100 text-red-700 hover:bg-red-200`;
      /** Default */
      default:
        return `${baseStyles} bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300`;
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={`${getButtonStyles()} ${sizeClasses.button}`}
        aria-label="Use current location"
      >
        {getButtonContent()}
      </button>

      {/* Status message */}
      {showStatus && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      {/* Permission hint */}
      {showStatus && permission === "denied" && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enable location access in your browser settings
        </p>
      )}
    </div>
  );
}

export default GPSButton;
