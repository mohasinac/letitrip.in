/**
 * Payment Gateway Configuration API Route
 * POST /api/admin/settings/payment-gateways/config
 *
 * Updates configuration for a specific payment gateway.
 * Requires admin authentication.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface GatewayConfigRequest {
  gateway: string;
  config: Record<string, any>;
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
    const body: GatewayConfigRequest = await request.json();
    const { gateway, config } = body;

    // Validate required fields
    if (!gateway) {
      return NextResponse.json(
        { error: "Missing required field: gateway" },
        { status: 400 }
      );
    }

    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Invalid or missing config object" },
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

    // Gateway-specific validation
    if (gateway === "razorpay") {
      const mode = config.mode || "test";
      const requiredFields = [`${mode}KeyId`, `${mode}KeySecret`];

      for (const field of requiredFields) {
        if (!config[field]) {
          return NextResponse.json(
            {
              error: `Missing required Razorpay field: ${field}`,
            },
            { status: 400 }
          );
        }
      }
    } else if (gateway === "paypal") {
      const mode = config.mode || "sandbox";
      const requiredFields = [`${mode}ClientId`, `${mode}ClientSecret`];

      for (const field of requiredFields) {
        if (!config[field]) {
          return NextResponse.json(
            {
              error: `Missing required PayPal field: ${field}`,
            },
            { status: 400 }
          );
        }
      }
    } else if (gateway === "stripe") {
      const mode = config.mode || "test";
      const requiredFields = [`${mode}PublishableKey`, `${mode}SecretKey`];

      for (const field of requiredFields) {
        if (!config[field]) {
          return NextResponse.json(
            {
              error: `Missing required Stripe field: ${field}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Update gateway configuration in Firestore
    const db = getFirestoreAdmin();
    await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .set(
        {
          [gateway]: {
            ...config,
            updatedAt: new Date(),
            updatedBy: authResult.user.uid,
          },
          updatedAt: new Date(),
          updatedBy: authResult.user.uid,
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        success: true,
        message: `${gateway} configuration updated successfully`,
        gateway,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "PaymentGatewayConfigAPI",
      method: "POST",
      context: "Failed to update gateway configuration",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to update gateway configuration",
      },
      { status: 500 }
    );
  }
}
