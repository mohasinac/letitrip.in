/**
 * Shiprocket Create Order API
 *
 * @status IMPLEMENTED
 * @task 1.3.2
 */

import { getCurrentUser } from "@/app/api/lib/session";
import type { ShipmentOrderParams } from "@/config/shiprocket.config";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params: ShipmentOrderParams = await request.json();

    // Validate required params
    if (
      !params.orderId ||
      !params.pickupLocationId ||
      !params.orderItems.length
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // TODO: Call Shiprocket API to create order
    // For now, return mock response
    const response = {
      orderId: params.orderId,
      shipmentId: `SH${Date.now()}`,
      status: "pending",
      awbAssignStatus: "pending",
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error as Error, {
      route: "POST /api/shipping/shiprocket/create-order",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
