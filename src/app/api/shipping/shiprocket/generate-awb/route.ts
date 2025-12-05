/**
 * Shiprocket Generate AWB API
 *
 * @status IMPLEMENTED
 * @task 1.3.2
 */

import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shipmentId, courierId } = await request.json();

    if (!shipmentId) {
      return NextResponse.json(
        { error: "Shipment ID required" },
        { status: 400 }
      );
    }

    // TODO: Call Shiprocket API to generate AWB
    const response = {
      awbCode: `AWB${Date.now()}`,
      courierName: "Blue Dart",
      courierCompanyId: 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error as Error, {
      route: "POST /api/shipping/shiprocket/generate-awb",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
