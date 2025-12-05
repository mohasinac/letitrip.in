/**
 * @fileoverview TypeScript Module
 * @module src/app/api/location/pincode/[pincode]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Pincode Lookup API Route
 * GET /api/location/pincode/[pincode]
 *
 * Looks up location data for an Indian pincode
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchPincodeData } from "@/app/api/lib/location/pincode";
import { validatePincode } from "@/app/api/lib/location/pincode";

/**
 * RouteParams interface
 * 
 * @interface
 * @description Defines the structure and contract for RouteParams
 */
interface RouteParams {
  /** Params */
  params: Promise<{
    /** Pincode */
    pincode: string;
  }>;
}

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {RouteParams} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, { params });
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {RouteParams} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, { params });
 */

export async function GET(
  /** Request */
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { pincode } = await params;

    // Validate pincode format
    if (!pincode || !validatePincode(pincode)) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
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
          /** Success */
          success: false,
          /** Error */
          error: "Pincode not found. Please check and try again.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: result,
    });
  } catch (error) {
    console.error("Pincode lookup error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error:
          error instanceof Error ? error.message : "Failed to lookup pincode",
      },
      { status: 500 },
    );
  }
}
