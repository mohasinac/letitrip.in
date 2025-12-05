/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/settings/payment-gateways/test/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Payment Gateway Test Connection API Route
 * POST /api/admin/settings/payment-gateways/test
 *
 * Tests connection to a payment gateway to verify credentials.
 * Requires admin authentication.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * TestConnectionRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for TestConnectionRequest
 */
interface TestConnectionRequest {
  /** Gateway */
  gateway: string;
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
    const body: TestConnectionRequest = await request.json();
    const { gateway } = body;

    // Validate required fields
    if (!gateway) {
      return NextResponse.json(
        { error: "Missing required field: gateway" },
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

    // Get gateway settings from Firestore
    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .get();

    if (!settingsDoc.exists) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const settings = settingsDoc.data();
    const gatewayConfig = settings?.[gateway];

    if (!gatewayConfig) {
      return NextResponse.json(
        { error: `${gateway} is not configured` },
        { status: 400 }
      );
    }

    let testResult: { success: boolean; message: string };

    // Test connection based on gateway
    switch (gateway) {
      case "razorpay":
        testResult = await testRazorpay(gatewayConfig);
        break;
      case "paypal":
        testResult = await testPayPal(gatewayConfig);
        break;
      case "stripe":
        testResult = await testStripe(gatewayConfig);
        break;
      /** Default */
      default:
        testResult = {
          /** Success */
          success: false,
          /** Message */
          message: `Testing for ${gateway} is not implemented yet`,
        };
    }

    return NextResponse.json(testResult, {
      /** Status */
      status: testResult.success ? 200 : 400,
    });
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PaymentGatewayTestAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Failed to test gateway connection",
    });

    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Message */
        message: error.message || "Failed to test gateway connection",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GATEWAY TEST FUNCTIONS
// ============================================================================

/**
 * Function: Test Razorpay
 */
/**
 * Performs test razorpay operation
 *
 * @param {any} config - The config
 *
 * @returns {Promise<any>} Promise resolving to testrazorpay result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs test razorpay operation
 *
 * @param {any} /** Config */
  config - The /**  config */
  config
 *
 * @returns {Promise<any>} Promise resolving to testrazorpay result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function testRazorpay(
  /** Config */
  config: any
): Promise<{ success: boolean; message: string }> {
  try {
    const mode = config.mode || "test";
    const keyId = config[`${mode}KeyId`];
    const keySecret = config[`${mode}KeySecret`];

    if (!keyId || !keySecret) {
      return {
        /** Success */
        success: false,
        /** Message */
        message: "Razorpay credentials not configured",
      };
    }

    // Import Razorpay SDK dynamically
    /**
     * Performs razorpay operation
     *
     * @returns {any} The razorpay result
     */

    /**
     * Performs razorpay operation
     *
     * @returns {any} The razorpay result
     */

    const Razorpay = (await import("razorpay" as any)) as any;
    const razorpay = new Razorpay.default({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Test by creating a minimal order (1 rupee)
    await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      /** Currency */
      currency: "INR",
      /** Receipt */
      receipt: `test_${Date.now()}`,
      /** Notes */
      notes: {
        /** Test */
        test: "connection_test",
      },
    });

    return {
      /** Success */
      success: true,
      /** Message */
      message: "Razorpay connection successful",
    };
  } catch (error: any) {
    return {
      /** Success */
      success: false,
      /** Message */
      message: `Razorpay test failed: ${
        error.message || "Invalid credentials"
      }`,
    };
  }
}

/**
 * Function: Test Pay Pal
 */
/**
 * Performs test pay pal operation
 *
 * @param {any} config - The config
 *
 * @returns {Promise<any>} Promise resolving to testpaypal result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs test pay pal operation
 *
 * @param {any} /** Config */
  config - The /**  config */
  config
 *
 * @returns {Promise<any>} Promise resolving to testpaypal result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function testPayPal(
  /** Config */
  config: any
): Promise<{ success: boolean; message: string }> {
  try {
    const mode = config.mode || "sandbox";
    const clientId = config[`${mode}ClientId`];
    const clientSecret = config[`${mode}ClientSecret`];

    if (!clientId || !clientSecret) {
      return {
        /** Success */
        success: false,
        /** Message */
        message: "PayPal credentials not configured",
      };
    }

    // PayPal API base URL
    const baseUrl =
      mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Test by getting an access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      /** Method */
      method: "POST",
      /** Headers */
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        /** Authorization */
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      /** Body */
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      return {
        /** Success */
        success: false,
        /** Message */
        message: "PayPal authentication failed - Invalid credentials",
      };
    }

    return {
      /** Success */
      success: true,
      /** Message */
      message: "PayPal connection successful",
    };
  } catch (error: any) {
    return {
      /** Success */
      success: false,
      /** Message */
      message: `PayPal test failed: ${error.message || "Connection error"}`,
    };
  }
}

/**
 * Function: Test Stripe
 */
/**
 * Performs test stripe operation
 *
 * @param {any} config - The config
 *
 * @returns {Promise<any>} Promise resolving to teststripe result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs test stripe operation
 *
 * @param {any} /** Config */
  config - The /**  config */
  config
 *
 * @returns {Promise<any>} Promise resolving to teststripe result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function testStripe(
  /** Config */
  config: any
): Promise<{ success: boolean; message: string }> {
  try {
    const mode = config.mode || "test";
    const secretKey = config[`${mode}SecretKey`];

    if (!secretKey) {
      return {
        /** Success */
        success: false,
        /** Message */
        message: "Stripe credentials not configured",
      };
    }

    // Test by fetching account details
    const response = await fetch("https://api.stripe.com/v1/balance", {
      /** Method */
      method: "GET",
      /** Headers */
      headers: {
        /** Authorization */
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      return {
        /** Success */
        success: false,
        /** Message */
        message: "Stripe authentication failed - Invalid credentials",
      };
    }

    return {
      /** Success */
      success: true,
      /** Message */
      message: "Stripe connection successful",
    };
  } catch (error: any) {
    return {
      /** Success */
      success: false,
      /** Message */
      message: `Stripe test failed: ${error.message || "Connection error"}`,
    };
  }
}
