/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/location/pincode
 * @description This file contains functionality related to pincode
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Location API Library - Pincode and Geocoding Utilities
 */

import type {
  IndiaPostPincodeResponse,
  PincodeData,
  PincodeLookupResult,
} from "@/types/shared/location.types";

// India Post API endpoint
const INDIA_POST_API = "https://api.postalpincode.in/pincode";

/**
 * Fetches pincode data from India Post API
 */
/**
 * Fetches pincode data from server
 *
 * @param {string} pincode - The pincode
 *
 * @returns {Promise<any>} Promise resolving to pincodedata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * fetchPincodeData("example");
 */

/**
 * Fetches pincode data from server
 *
 * @param {string} /** Pincode */
  pincode - The /**  pincode */
  pincode
 *
 * @returns {Promise<any>} Promise resolving to pincodedata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * fetchPincodeData("example");
 */

export async function fetchPincodeData(
  /** Pincode */
  pincode: string
): Promise<PincodeLookupResult> {
  // Validate pincode format
  const cleaned = pincode.replace(/\D/g, "");
  if (cleaned.length !== 6 || !/^[1-9]/.test(cleaned)) {
    return {
      pincode,
      /** Areas */
      areas: [],
      /** City */
      city: "",
      /** District */
      district: "",
      /** State */
      state: "",
      /** Country */
      country: "India",
      /** Is Valid */
      isValid: false,
      /** Has Multiple Areas */
      hasMultipleAreas: false,
    };
  }

  try {
    const response = await fetch(`${INDIA_POST_API}/${cleaned}`, {
      /** Headers */
      headers: {
        /** Accept */
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    /**
     * Performs data operation
     *
     * @returns {any} The data result
     */

    /**
     * Performs data operation
     *
     * @returns {any} The data result
     */

    const data = (await response.json()) as IndiaPostPincodeResponse[];

    // India Post API returns an array with one item
    const result = data[0];

    if (
      result.Status !== "Success" ||
      !result.PostOffice ||
      result.PostOffice.length === 0
    ) {
      return {
        /** Pincode */
        pincode: cleaned,
        /** Areas */
        areas: [],
        /** City */
        city: "",
        /** District */
        district: "",
        /** State */
        state: "",
        /** Country */
        country: "India",
        /** Is Valid */
        isValid: false,
        /** Has Multiple Areas */
        hasMultipleAreas: false,
      };
    }

    // Extract unique areas
    const areas = [...new Set(result.PostOffice.map((po) => po.Name))];

    // Use first post office for common data
    const firstPO = result.PostOffice[0];

    return {
      /** Pincode */
      pincode: cleaned,
      areas,
      /** City */
      city: firstPO.Division || firstPO.District,
      /** District */
      district: firstPO.District,
      /** State */
      state: firstPO.State,
      /** Country */
      country: "India",
      /** Is Valid */
      isValid: true,
      /** Has Multiple Areas */
      hasMultipleAreas: areas.length > 1,
    };
  } catch (error) {
    console.error("Pincode lookup error:", error);
    throw new Error("Failed to lookup pincode. Please try again.");
  }
}

/**
 * Transforms India Post response to internal format
 */
/**
 * Transforms pincode response
 *
 * @param {IndiaPostPincodeResponse[]} response - The response
 *
 * @returns {any} The transformpincoderesponse result
 *
 * @example
 * transformPincodeResponse(response);
 */

/**
 * Transforms pincode response
 *
 * @param {IndiaPostPincodeResponse[]} /** Response */
  response - The /**  response */
  response
 *
 * @returns {any} The transformpincoderesponse result
 *
 * @example
 * transformPincodeResponse(/** Response */
  response);
 */

export function transformPincodeResponse(
  /** Response */
  response: IndiaPostPincodeResponse[]
): PincodeData | null {
  const result = response[0];

  if (result.Status !== "Success" || !result.PostOffice) {
    return null;
  }

  const postOffices = result.PostOffice;
  const firstPO = postOffices[0];

  return {
    /** Pincode */
    pincode: firstPO.Pincode,
    /** Areas */
    areas: postOffices.map((po) => ({
      /** Name */
      name: po.Name,
      /** Branch Type */
      branchType: po.BranchType,
      /** Delivery Status */
      deliveryStatus: po.DeliveryStatus === "Delivery",
    })),
    /** City */
    city: firstPO.Division || firstPO.District,
    /** District */
    district: firstPO.District,
    /** State */
    state: firstPO.State,
    /** Country */
    country: "India",
  };
}

/**
 * Validates pincode format
 */
/**
 * Validates pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validatePincode("example");
 */

/**
 * Validates pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validatePincode("example");
 */

export function validatePincode(pincode: string): boolean {
  const cleaned = pincode.replace(/\D/g, "");
  return cleaned.length === 6 && /^[1-9]/.test(cleaned);
}
