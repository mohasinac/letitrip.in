/**
 * Location Service - GPS, Pincode, and Geocoding
 *
 * Handles all location-related operations on the frontend.
 * Uses apiService to call API routes - NEVER accesses database directly.
 */

import { apiService } from "./api.service";
import { logError } from "@/lib/firebase-error-logger";
import type {
  PincodeLookupResult,
  GeoCoordinates,
  GeolocationError,
  ReverseGeocodeResult,
} from "@/types/shared/location.types";

class LocationService {
  // ============================================================================
  // PINCODE LOOKUP
  // ============================================================================

  /**
   * Lookup location data from a pincode
   */
  async lookupPincode(pincode: string): Promise<PincodeLookupResult> {
    const cleaned = pincode.replace(/\D/g, "");

    if (cleaned.length !== 6) {
      return {
        pincode: cleaned,
        areas: [],
        city: "",
        district: "",
        state: "",
        country: "India",
        isValid: false,
        hasMultipleAreas: false,
      };
    }

    const response = await apiService.get<{
      success: boolean;
      data: PincodeLookupResult;
    }>(`/location/pincode/${cleaned}`);

    return response.data;
  }

  /**
   * Validate pincode format
   */
  isValidPincode(pincode: string): boolean {
    const cleaned = pincode.replace(/\D/g, "");
    return cleaned.length === 6 && /^[1-9]/.test(cleaned);
  }

  // ============================================================================
  // GPS / GEOLOCATION
  // ============================================================================

  /**
   * Get current GPS coordinates
   */
  async getCurrentPosition(): Promise<GeoCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: "NOT_SUPPORTED",
          message: "Geolocation is not supported by your browser",
        } as GeolocationError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let code: GeolocationError["code"];
          let message: string;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              code = "PERMISSION_DENIED";
              message =
                "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              code = "POSITION_UNAVAILABLE";
              message = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              code = "TIMEOUT";
              message = "Location request timed out. Please try again.";
              break;
            default:
              code = "POSITION_UNAVAILABLE";
              message = "An unknown error occurred.";
          }

          reject({ code, message } as GeolocationError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  /**
   * Check if geolocation is supported and permission granted
   */
  async checkGeolocationPermission(): Promise<"granted" | "denied" | "prompt"> {
    if (!navigator.permissions) {
      // Fallback for browsers without permissions API
      return "prompt";
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state as "granted" | "denied" | "prompt";
    } catch {
      return "prompt";
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * Note: Requires Google Maps API integration
   */
  async reverseGeocode(
    coords: GeoCoordinates
  ): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: ReverseGeocodeResult;
      }>(`/location/geocode?lat=${coords.latitude}&lng=${coords.longitude}`);
      return response.data;
    } catch (error: any) {
      logError(error, {
        component: "LocationService.reverseGeocode",
        metadata: { coords },
      });
      return null;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Format coordinates for display
   */
  formatCoordinates(coords: GeoCoordinates): string {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  calculateDistance(from: GeoCoordinates, to: GeoCoordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);
    const lat1 = this.toRad(from.latitude);
    const lat2 = this.toRad(to.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Format phone number with country code
   */
  formatPhoneWithCode(phone: string, countryCode: string = "+91"): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `${countryCode} ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return phone;
  }

  /**
   * Get WhatsApp link for a phone number
   */
  getWhatsAppLink(phone: string, countryCode: string = "+91"): string {
    const cleaned = phone.replace(/\D/g, "");
    const code = countryCode.replace("+", "");
    return `https://wa.me/${code}${cleaned}`;
  }

  /**
   * Get tel: link for a phone number
   */
  getTelLink(phone: string, countryCode: string = "+91"): string {
    const cleaned = phone.replace(/\D/g, "");
    return `tel:${countryCode}${cleaned}`;
  }
}

export const locationService = new LocationService();
