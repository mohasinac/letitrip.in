/**
 * Pincode Lookup API Route
 * GET /api/location/pincode/[pincode]
 *
 * Looks up location data for an Indian pincode
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchPincodeData } from "@/app/api/lib/location/pincode";
import { validatePincode } from "@/app/api/lib/location/pincode";

interface RouteParams {
  params: Promise<{
    pincode: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { pincode } = await params;

    // Validate pincode format
    if (!pincode || !validatePincode(pincode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pincode format. Must be 6 digits starting with 1-9.",
        },
        { status: 400 },
      );
    }

    // Fetch pincode data
    const result = await fetchPincodeData(pincode);

    if (!result.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Pincode not found. Please check and try again.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Pincode lookup error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to lookup pincode",
      },
      { status: 500 },
    );
  }
}
