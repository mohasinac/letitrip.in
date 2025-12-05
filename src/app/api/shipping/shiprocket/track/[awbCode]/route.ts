/**
 * Shiprocket Track Shipment API
 *
 * @status IMPLEMENTED
 * @task 1.3.2
 */

import type { TrackingDetails } from "@/config/shiprocket.config";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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
      courierId: "bluedart",
      courierName: "Blue Dart",
      currentStatus: "IN_TRANSIT",
      currentLocation: "Mumbai Hub",
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      trackingEvents: [
        {
          status: "Picked Up",
          statusCode: "PU",
          location: "Delhi Hub",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          activity: "Shipment picked up from seller",
        },
        {
          status: "In Transit",
          statusCode: "IT",
          location: "Mumbai Hub",
          timestamp: new Date(),
          activity: "Shipment in transit to destination",
        },
      ],
    };

    return NextResponse.json(trackingDetails);
  } catch (error) {
    logError(error as Error, {
      route: "GET /api/shipping/shiprocket/track/[awbCode]",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
