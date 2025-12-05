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
export async function fetchPincodeData(
  pincode: string
): Promise<PincodeLookupResult> {
  // Validate pincode format
  const cleaned = pincode.replace(/\D/g, "");
  if (cleaned.length !== 6 || !/^[1-9]/.test(cleaned)) {
    return {
      pincode,
      areas: [],
      city: "",
      district: "",
      state: "",
      country: "India",
      isValid: false,
      hasMultipleAreas: false,
    };
  }

  try {
    const response = await fetch(`${INDIA_POST_API}/${cleaned}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as IndiaPostPincodeResponse[];

    // India Post API returns an array with one item
    const result = data[0];

    if (
      result.Status !== "Success" ||
      !result.PostOffice ||
      result.PostOffice.length === 0
    ) {
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

    // Extract unique areas
    const areas = [...new Set(result.PostOffice.map((po) => po.Name))];

    // Use first post office for common data
    const firstPO = result.PostOffice[0];

    return {
      pincode: cleaned,
      areas,
      city: firstPO.Division || firstPO.District,
      district: firstPO.District,
      state: firstPO.State,
      country: "India",
      isValid: true,
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
export function transformPincodeResponse(
  response: IndiaPostPincodeResponse[]
): PincodeData | null {
  const result = response[0];

  if (result.Status !== "Success" || !result.PostOffice) {
    return null;
  }

  const postOffices = result.PostOffice;
  const firstPO = postOffices[0];

  return {
    pincode: firstPO.Pincode,
    areas: postOffices.map((po) => ({
      name: po.Name,
      branchType: po.BranchType,
      deliveryStatus: po.DeliveryStatus === "Delivery",
    })),
    city: firstPO.Division || firstPO.District,
    district: firstPO.District,
    state: firstPO.State,
    country: "India",
  };
}

/**
 * Validates pincode format
 */
export function validatePincode(pincode: string): boolean {
  const cleaned = pincode.replace(/\D/g, "");
  return cleaned.length === 6 && /^[1-9]/.test(cleaned);
}
