"use client";

import React, { useState, useCallback } from "react";
import { MapPin, Loader2, XCircle, CheckCircle } from "lucide-react";
import { locationService } from "@/services/location.service";
import type {
  GeoCoordinates,
  GeolocationError,
  ReverseGeocodeResult,
} from "@/types/shared/location.types";

export interface GPSButtonProps {
  onLocationDetected?: (coords: GeoCoordinates) => void;
  onAddressDetected?: (address: ReverseGeocodeResult) => void;
  onError?: (error: GeolocationError) => void;
  disabled?: boolean;
  className?: string;
  variant?: "button" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  reverseGeocode?: boolean;
}

type Status = "idle" | "loading" | "success" | "error";

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

  const handleClick = async () => {
    if (disabled || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      // Check permission first
      const perm = await checkPermission();
      if (perm === "denied") {
        const error: GeolocationError = {
          code: "PERMISSION_DENIED",
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

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="animate-spin" />;
      case "success":
        return <CheckCircle className="text-green-500" />;
      case "error":
        return <XCircle className="text-red-500" />;
      default:
        return <MapPin />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          button: "px-2 py-1 text-sm",
          icon: "w-4 h-4",
        };
      case "lg":
        return {
          button: "px-4 py-3 text-lg",
          icon: "w-6 h-6",
        };
      default:
        return {
          button: "px-3 py-2 text-base",
          icon: "w-5 h-5",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getButtonContent = () => {
    const icon = React.cloneElement(getIcon(), {
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

  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center
      rounded-lg font-medium
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-primary/50
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (status) {
      case "success":
        return `${baseStyles} bg-green-100 text-green-700 hover:bg-green-200`;
      case "error":
        return `${baseStyles} bg-red-100 text-red-700 hover:bg-red-200`;
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
