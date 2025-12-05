/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/payment-gateways/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

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
          /** Razorpay */
          razorpay: {
            /** Enabled */
            enabled: false,
            /** Mode */
            mode: "test",
          },
          /** Paypal */
          paypal: {
            /** Enabled */
            enabled: false,
            /** Mode */
            mode: "sandbox",
          },
          /** Stripe */
          stripe: {
            /** Enabled */
            enabled: false,
            /** Mode */
            mode: "test",
          },
          /** Payu */
          payu: {
            /** Enabled */
            enabled: false,
            /** Mode */
            mode: "test",
          },
          /** Phonepe */
          phonepe: {
            /** Enabled */
            enabled: false,
            /** Mode */
            mode: "test",
          },
          /** Cashfree */
          cashfree: {
            /** Enabled */
            enabled: false,
            /** Mode */
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
      /** Component */
      component: "PaymentGatewaySettingsAPI",
      /** Method */
      method: "GET",
      /** Context */
      context: "Failed to retrieve gateway settings",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to retrieve gateway settings",
      },
      { status: 500 }
    );
  }
}

/**
 * Function: P U T
 */
/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request);
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(request);
 */

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
        message: "Payment gateway settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PaymentGatewaySettingsAPI",
      /** Method */
      method: "PUT",
      /** Context */
      context: "Failed to update gateway settings",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to update gateway settings",
      },
      { status: 500 }
    );
  }
}
