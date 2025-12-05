/**
 * Payment Gateway Settings API Route
 * GET /api/admin/settings/payment-gateways - Get all gateway settings
 * PUT /api/admin/settings/payment-gateways - Update gateway settings
 *
 * Manages payment gateway configuration in Firestore.
 * Requires admin authentication.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    // Get gateway settings from Firestore
    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .get();

    if (!settingsDoc.exists) {
      // Return default empty settings
      return NextResponse.json(
        {
          razorpay: {
            enabled: false,
            mode: "test",
          },
          paypal: {
            enabled: false,
            mode: "sandbox",
          },
          stripe: {
            enabled: false,
            mode: "test",
          },
          payu: {
            enabled: false,
            mode: "test",
          },
          phonepe: {
            enabled: false,
            mode: "test",
          },
          cashfree: {
            enabled: false,
            mode: "test",
          },
        },
        { status: 200 }
      );
    }

    const settings = settingsDoc.data();

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    logError(error, {
      component: "PaymentGatewaySettingsAPI",
      method: "GET",
      context: "Failed to retrieve gateway settings",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve gateway settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json();

    // Validate at least one gateway config is present
    const validGateways = [
      "razorpay",
      "paypal",
      "stripe",
      "payu",
      "phonepe",
      "cashfree",
    ];
    const hasValidGateway = validGateways.some((gateway) => body[gateway]);

    if (!hasValidGateway) {
      return NextResponse.json(
        { error: "At least one gateway configuration is required" },
        { status: 400 }
      );
    }

    // Update gateway settings in Firestore
    const db = getFirestoreAdmin();
    await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .set(
        {
          ...body,
          updatedAt: new Date(),
          updatedBy: authResult.user.uid,
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        success: true,
        message: "Payment gateway settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "PaymentGatewaySettingsAPI",
      method: "PUT",
      context: "Failed to update gateway settings",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to update gateway settings",
      },
      { status: 500 }
    );
  }
}
