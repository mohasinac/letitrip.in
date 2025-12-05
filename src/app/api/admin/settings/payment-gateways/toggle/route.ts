/**
 * Payment Gateway Toggle API Route
 * POST /api/admin/settings/payment-gateways/toggle
 *
 * Toggles a payment gateway on or off.
 * Requires admin authentication.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface ToggleGatewayRequest {
  gateway: string;
  enabled: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthFromRequest(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Check admin role
    if (authResult.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body: ToggleGatewayRequest = await request.json();
    const { gateway, enabled } = body;

    // Validate required fields
    if (!gateway) {
      return NextResponse.json(
        { error: "Missing required field: gateway" },
        { status: 400 }
      );
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid field: enabled must be a boolean" },
        { status: 400 }
      );
    }

    // Validate gateway name
    const validGateways = [
      "razorpay",
      "paypal",
      "stripe",
      "payu",
      "phonepe",
      "cashfree",
    ];
    if (!validGateways.includes(gateway)) {
      return NextResponse.json(
        { error: `Invalid gateway: ${gateway}` },
        { status: 400 }
      );
    }

    // Update gateway enabled status in Firestore
    const db = getFirestoreAdmin();
    await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .set(
        {
          [gateway]: {
            enabled,
          },
          updatedAt: new Date(),
          updatedBy: authResult.user.uid,
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        success: true,
        message: `${gateway} has been ${enabled ? "enabled" : "disabled"}`,
        gateway,
        enabled,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "PaymentGatewayToggleAPI",
      method: "POST",
      context: "Failed to toggle gateway",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to toggle gateway",
      },
      { status: 500 }
    );
  }
}
