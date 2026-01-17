"use client";

/**
 * GPSButton Component
 *
 * Framework-agnostic GPS/geolocation button with status indicators.
 * Uses browser Geolocation API with injectable reverse geocoding.
 *
 * @example
 * ```tsx
 * <GPSButton
 *   onLocationDetected={(coords) => console.log(coords)}
 *   onAddressDetected={(address) => setAddress(address)}
 *   variant="button"
 *   size="md"
 * />
 * ```
 */

import React, { useCallback, useState } from "react";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationError {
  code: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN";
  message: string;
}

export interface GPSButtonProps {
  /** Location detected callback */
  onLocationDetected?: (coords: GeoCoordinates) => void;
  /** Address detected callback (if reverseGeocode enabled) */
  onAddressDetected?: (address: any) => void;
  /** Error callback */
  onError?: (error: GeolocationError) => void;
  /** Reverse geocoding function (injectable) */
  reverseGeocode?: (coords: GeoCoordinates) => Promise<any>;
  /** Disabled state */
  disabled?: boolean;
  /** Button variant */
  variant?: "button" | "icon" | "text";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Show status messages */
  showStatus?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom MapPin icon */
  MapPinIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Loader icon */
  LoaderIcon?: React.ComponentType<{ className?: string }>;
  /** Custom CheckCircle icon */
  CheckCircleIcon?: React.ComponentType<{ className?: string }>;
  /** Custom XCircle icon */
  XCircleIcon?: React.ComponentType<{ className?: string }>;
}

type Status = "idle" | "loading" | "success" | "error";

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultMapPinIcon({ className }: { className?: string }) {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function DefaultLoaderIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function DefaultCheckCircleIcon({ className }: { className?: string }) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function DefaultXCircleIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function GPSButton({
  onLocationDetected,
  onAddressDetected,
  onError,
  reverseGeocode,
  disabled = false,
  variant = "button",
  size = "md",
  showStatus = true,
  className = "",
  MapPinIcon = DefaultMapPinIcon,
  LoaderIcon = DefaultLoaderIcon,
  CheckCircleIcon = DefaultCheckCircleIcon,
  XCircleIcon = DefaultXCircleIcon,
}: GPSButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClick = useCallback(async () => {
    if (disabled || status === "loading" || !navigator.geolocation) {
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: "POSITION_UNAVAILABLE",
          message: "Geolocation is not supported by this browser",
        };
        setStatus("error");
        setErrorMessage(error.message);
        onError?.(error);
      }
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const coords: GeoCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };

      onLocationDetected?.(coords);

      // Reverse geocode if provided
      if (reverseGeocode && onAddressDetected) {
        try {
          const address = await reverseGeocode(coords);
          if (address) {
            onAddressDetected(address);
          }
        } catch (geocodeError) {
          console.warn("Reverse geocode failed:", geocodeError);
        }
      }

      setStatus("success");

      // Reset to idle after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error: any) {
      let geoError: GeolocationError;

      if (error.code === 1) {
        geoError = {
          code: "PERMISSION_DENIED",
          message:
            "Location permission denied. Please enable in browser settings.",
        };
      } else if (error.code === 2) {
        geoError = {
          code: "POSITION_UNAVAILABLE",
          message: "Location information is unavailable.",
        };
      } else if (error.code === 3) {
        geoError = {
          code: "TIMEOUT",
          message: "Location request timed out.",
        };
      } else {
        geoError = {
          code: "UNKNOWN",
          message: error.message || "Failed to get location",
        };
      }

      setStatus("error");
      setErrorMessage(geoError.message);
      onError?.(geoError);

      // Reset to idle after 5 seconds on error
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  }, [
    disabled,
    status,
    onLocationDetected,
    onAddressDetected,
    onError,
    reverseGeocode,
  ]);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <LoaderIcon className={cn(iconSizes[size], "animate-spin")} />;
      case "success":
        return (
          <CheckCircleIcon className={cn(iconSizes[size], "text-green-500")} />
        );
      case "error":
        return <XCircleIcon className={cn(iconSizes[size], "text-red-500")} />;
      default:
        return <MapPinIcon className={iconSizes[size]} />;
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={cn(
          "inline-flex items-center justify-center rounded-lg",
          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
          size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10",
          (disabled || status === "loading") && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label="Detect location"
      >
        {getIcon()}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={cn(
          "inline-flex items-center gap-2 font-medium",
          "text-blue-600 dark:text-blue-400 hover:underline",
          (disabled || status === "loading") && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {getIcon()}
        {status === "loading" ? "Detecting..." : "Use Current Location"}
      </button>
    );
  }

  // Button variant
  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={disabled || status === "loading"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "bg-blue-600 text-white hover:bg-blue-700",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
          sizeClasses[size],
          (disabled || status === "loading") && "opacity-50 cursor-not-allowed"
        )}
      >
        {getIcon()}
        {status === "loading" && "Detecting..."}
        {status === "success" && "Location Detected"}
        {status === "error" && "Try Again"}
        {status === "idle" && "Use Current Location"}
      </button>
      {showStatus && errorMessage && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default GPSButton;
