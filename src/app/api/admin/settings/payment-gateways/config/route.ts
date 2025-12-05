/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/payment-gateways/config/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * GatewayConfigRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for GatewayConfigRequest
 */
interface GatewayConfigRequest {
  /** Gateway */
  gateway: string;
  /** Config */
  config: Record<string, any>;
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
              /** Error */
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
              /** Error */
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
              /** Error */
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
            /** Updated At */
            updatedAt: new Date(),
            /** Updated By */
            updatedBy: authResult.user.uid,
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
        message: `${gateway} configuration updated successfully`,
        gateway,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PaymentGatewayConfigAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Failed to update gateway configuration",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to update gateway configuration",
      },
      { status: 500 }
    );
  }
}
