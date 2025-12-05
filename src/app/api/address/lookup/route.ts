/**
 * @fileoverview TypeScript Module
 * @module src/app/api/address/lookup/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Address Lookup API Route
 * GET /api/address/lookup?code=postalcode&country=countrycode
 *
 * Looks up address details by postal/PIN code.
 * Public endpoint - no authentication required.
 */

import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * PincodeAPIResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for PincodeAPIResponse
 */
interface PincodeAPIResponse {
  /** Message */
  Message: string;
  /** Status */
  Status: string;
  /** Post Office */
  PostOffice: Array<{
    /** Name */
    Name: string;
    /** Description */
    Description: string | null;
    /** Branch Type */
    BranchType: string;
    /** Delivery Status */
    DeliveryStatus: string;
    /** Circle */
    Circle: string;
    /** District */
    District: string;
    /** Division */
    Division: string;
    /** Region */
    Region: string;
    /** Block */
    Block: string;
    /** State */
    State: string;
    /** Country */
    Country: string;
    /** Pincode */
    Pincode: string;
  }> | null;
}

/**
 * PostalCodeAPIResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for PostalCodeAPIResponse
 */
interface PostalCodeAPIResponse {
  "post code": string;
  /** Country */
  country: string;
  "country abbreviation": string;
  /** Places */
  places: Array<{
    "place name": string;
    /** Longitude */
    longitude: string;
    /** State */
    state: string;
    "state abbreviation": string;
    /** Latitude */
    latitude: string;
  }>;
}

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const country = searchParams.get("country") || "IN";

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { error: "Missing required parameter: code" },
        { status: 400 }
      );
    }

    // Validate code format
    const codePattern = /^[A-Z0-9\s-]+$/i;
    if (!codePattern.test(code)) {
      return NextResponse.json(
        { error: "Invalid postal code format" },
        { status: 400 }
      );
    }

    let result: any;

    // Handle Indian PIN codes
    if (country.toUpperCase() === "IN") {
      // Use India Post API
      const apiUrl = `https://api.postalpincode.in/pincode/${code}`;

      const response = await fetch(apiUrl, {
        /** Headers */
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch PIN code details");
      }

      const data: PincodeAPIResponse[] = await response.json();

      if (!data || data.length === 0 || data[0].Status !== "Success") {
        return NextResponse.json(
          {
            /** Error */
            error: "PIN code not found",
            code,
          },
          { status: 404 }
        );
      }

      const postOffice = data[0].PostOffice?.[0];
      if (!postOffice) {
        return NextResponse.json(
          {
            /** Error */
            error: "No post office data found for this PIN code",
            code,
          },
          { status: 404 }
        );
      }

      result = {
        /** Postal Code */
        postalCode: postOffice.Pincode,
        /** City */
        city: postOffice.Block || postOffice.Name,
        /** District */
        district: postOffice.District,
        /** State */
        state: postOffice.State,
        /** State Code */
        stateCode: getIndianStateCode(postOffice.State),
        /** Country */
        country: "India",
        /** Country Code */
        countryCode: "IN",
        /** Region */
        region: postOffice.Region,
        /** Division */
        division: postOffice.Division,
      };
    } else {
      // Use Zippopotam API for international postal codes
      const apiUrl = `https://api.zippopotam.us/${country.toLowerCase()}/${code}`;

      const response = await fetch(apiUrl, {
        /** Headers */
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            {
              /** Error */
              error: "Postal code not found",
              code,
              country,
            },
            { status: 404 }
          );
        }
        throw new Error("Failed to fetch postal code details");
      }

      const data: PostalCodeAPIResponse = await response.json();

      const place = data.places?.[0];
      if (!place) {
        return NextResponse.json(
          {
            /** Error */
            error: "No location data found for this postal code",
            code,
          },
          { status: 404 }
        );
      }

      result = {
        /** Postal Code */
        postalCode: data["post code"],
        /** City */
        city: place["place name"],
        /** State */
        state: place.state,
        /** State Code */
        stateCode: place["state abbreviation"],
        /** Country */
        country: data.country,
        /** Country Code */
        countryCode: data["country abbreviation"],
        /** Latitude */
        latitude: place.latitude,
        /** Longitude */
        longitude: place.longitude,
        /** Places */
        places: data.places.map((p) => ({
          /** Name */
          name: p["place name"],
          /** Latitude */
          latitude: p.latitude,
          /** Longitude */
          longitude: p.longitude,
        })),
      };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "AddressLookupAPI",
      /** Method */
      method: "GET",
      /** Context */
      context: "Failed to lookup address",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to lookup address",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retrieves indian state code
 */
/**
 * Retrieves indian state code
 *
 * @param {string} stateName - Name of state
 *
 * @returns {string} The indianstatecode result
 */

/**
 * Retrieves indian state code
 *
 * @param {string} stateName - Name of state
 *
 * @returns {string} The indianstatecode result
 */

function getIndianStateCode(stateName: string): string {
  const stateCodeMap: Record<string, string> = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    /** Assam */
    Assam: "AS",
    /** Bihar */
    Bihar: "BR",
    /** Chhattisgarh */
    Chhattisgarh: "CG",
    /** Goa */
    Goa: "GA",
    /** Gujarat */
    Gujarat: "GJ",
    /** Haryana */
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    /** Jharkhand */
    Jharkhand: "JH",
    /** Karnataka */
    Karnataka: "KA",
    /** Kerala */
    Kerala: "KL",
    "Madhya Pradesh": "MP",
    /** Maharashtra */
    Maharashtra: "MH",
    /** Manipur */
    Manipur: "MN",
    /** Meghalaya */
    Meghalaya: "ML",
    /** Mizoram */
    Mizoram: "MZ",
    /** Nagaland */
    Nagaland: "NL",
    /** Odisha */
    Odisha: "OR",
    /** Punjab */
    Punjab: "PB",
    /** Rajasthan */
    Rajasthan: "RJ",
    /** Sikkim */
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    /** Telangana */
    Telangana: "TS",
    /** Tripura */
    Tripura: "TR",
    "Uttar Pradesh": "UP",
    /** Uttarakhand */
    Uttarakhand: "UK",
    "West Bengal": "WB",
    "Andaman and Nicobar Islands": "AN",
    /** Chandigarh */
    Chandigarh: "CH",
    "Dadra and Nagar Haveli and Daman and Diu": "DH",
    /** Delhi */
    Delhi: "DL",
    /** Jammu */
    Jammu: "JK",
    /** Kashmir */
    Kashmir: "JK",
    "Jammu and Kashmir": "JK",
    /** Ladakh */
    Ladakh: "LA",
    /** Lakshadweep */
    Lakshadweep: "LD",
    /** Puducherry */
    Puducherry: "PY",
  };

  return stateCodeMap[stateName] || stateName.substring(0, 2).toUpperCase();
}
