/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/payment-gateways/toggle/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * ToggleGatewayRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for ToggleGatewayRequest
 */
interface ToggleGatewayRequest {
  /** Gateway */
  gateway: string;
  /** Enabled */
  enabled: boolean;
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

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
          /** Updated At */
          updatedAt: new Date(),
          /** Updated By */
          updatedBy: authResult.user.uid,
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        /** Success */
        success: true,
        /** Message */
        message: `${gateway} has been ${enabled ? "enabled" : "disabled"}`,
        gateway,
        enabled,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PaymentGatewayToggleAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Failed to toggle gateway",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to toggle gateway",
      },
      { status: 500 }
    );
  }
}
