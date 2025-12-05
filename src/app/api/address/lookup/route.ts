/**
 * Address Lookup API Route
 * GET /api/address/lookup?code=postalcode&country=countrycode
 *
 * Looks up address details by postal/PIN code.
 * Public endpoint - no authentication required.
 */

import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface PincodeAPIResponse {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    Description: string | null;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    Block: string;
    State: string;
    Country: string;
    Pincode: string;
  }> | null;
}

interface PostalCodeAPIResponse {
  "post code": string;
  country: string;
  "country abbreviation": string;
  places: Array<{
    "place name": string;
    longitude: string;
    state: string;
    "state abbreviation": string;
    latitude: string;
  }>;
}

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
            error: "No post office data found for this PIN code",
            code,
          },
          { status: 404 }
        );
      }

      result = {
        postalCode: postOffice.Pincode,
        city: postOffice.Block || postOffice.Name,
        district: postOffice.District,
        state: postOffice.State,
        stateCode: getIndianStateCode(postOffice.State),
        country: "India",
        countryCode: "IN",
        region: postOffice.Region,
        division: postOffice.Division,
      };
    } else {
      // Use Zippopotam API for international postal codes
      const apiUrl = `https://api.zippopotam.us/${country.toLowerCase()}/${code}`;

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            {
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
            error: "No location data found for this postal code",
            code,
          },
          { status: 404 }
        );
      }

      result = {
        postalCode: data["post code"],
        city: place["place name"],
        state: place.state,
        stateCode: place["state abbreviation"],
        country: data.country,
        countryCode: data["country abbreviation"],
        latitude: place.latitude,
        longitude: place.longitude,
        places: data.places.map((p) => ({
          name: p["place name"],
          latitude: p.latitude,
          longitude: p.longitude,
        })),
      };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    logError(error, {
      component: "AddressLookupAPI",
      method: "GET",
      context: "Failed to lookup address",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to lookup address",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getIndianStateCode(stateName: string): string {
  const stateCodeMap: Record<string, string> = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    Assam: "AS",
    Bihar: "BR",
    Chhattisgarh: "CG",
    Goa: "GA",
    Gujarat: "GJ",
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    Jharkhand: "JH",
    Karnataka: "KA",
    Kerala: "KL",
    "Madhya Pradesh": "MP",
    Maharashtra: "MH",
    Manipur: "MN",
    Meghalaya: "ML",
    Mizoram: "MZ",
    Nagaland: "NL",
    Odisha: "OR",
    Punjab: "PB",
    Rajasthan: "RJ",
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    Telangana: "TS",
    Tripura: "TR",
    "Uttar Pradesh": "UP",
    Uttarakhand: "UK",
    "West Bengal": "WB",
    "Andaman and Nicobar Islands": "AN",
    Chandigarh: "CH",
    "Dadra and Nagar Haveli and Daman and Diu": "DH",
    Delhi: "DL",
    Jammu: "JK",
    Kashmir: "JK",
    "Jammu and Kashmir": "JK",
    Ladakh: "LA",
    Lakshadweep: "LD",
    Puducherry: "PY",
  };

  return stateCodeMap[stateName] || stateName.substring(0, 2).toUpperCase();
}
