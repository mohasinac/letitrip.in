/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shipping/shiprocket/track/[awbCode]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Shiprocket Track Shipment API
 *
 * @status IMPLEMENTED
 * @task 1.3.2
 */

import type { TrackingDetails } from "@/config/shiprocket.config";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ awbCode: string }> }
) {
  try {
    const { awbCode } = await params;

    if (!awbCode) {
      return NextResponse.json({ error: "AWB code required" }, { status: 400 });
    }

    // TODO: Call Shiprocket API to track shipment
    const trackingDetails: TrackingDetails = {
      awbCode,
      /** Courier Id */
      courierId: "bluedart",
      /** Courier Name */
      courierName: "Blue Dart",
      /** Current Status */
      currentStatus: "IN_TRANSIT",
      /** Current Location */
      currentLocation: "Mumbai Hub",
      /** Estimated Delivery Date */
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      /** Tracking Events */
      trackingEvents: [
        {
          /** Status */
          status: "Picked Up",
          /** Status Code */
          statusCode: "PU",
          /** Location */
          location: "Delhi Hub",
          /** Timestamp */
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          /** Activity */
          activity: "Shipment picked up from seller",
        },
        {
          /** Status */
          status: "In Transit",
          /** Status Code */
          statusCode: "IT",
          /** Location */
          location: "Mumbai Hub",
          /** Timestamp */
          timestamp: new Date(),
          /** Activity */
          activity: "Shipment in transit to destination",
        },
      ],
    };

    return NextResponse.json(trackingDetails);
  } catch (error) {
    logError(error as Error, {
      /** Route */
      route: "GET /api/shipping/shiprocket/track/[awbCode]",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
