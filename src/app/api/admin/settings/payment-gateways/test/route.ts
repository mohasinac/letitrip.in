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

interface TestConnectionRequest {
  gateway: string;
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
      default:
        testResult = {
          success: false,
          message: `Testing for ${gateway} is not implemented yet`,
        };
    }

    return NextResponse.json(testResult, {
      status: testResult.success ? 200 : 400,
    });
  } catch (error: any) {
    logError(error, {
      component: "PaymentGatewayTestAPI",
      method: "POST",
      context: "Failed to test gateway connection",
    });

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to test gateway connection",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GATEWAY TEST FUNCTIONS
// ============================================================================

async function testRazorpay(
  config: any
): Promise<{ success: boolean; message: string }> {
  try {
    const mode = config.mode || "test";
    const keyId = config[`${mode}KeyId`];
    const keySecret = config[`${mode}KeySecret`];

    if (!keyId || !keySecret) {
      return {
        success: false,
        message: "Razorpay credentials not configured",
      };
    }

    // Import Razorpay SDK dynamically
    const Razorpay = (await import("razorpay" as any)) as any;
    const razorpay = new Razorpay.default({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Test by creating a minimal order (1 rupee)
    await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: {
        test: "connection_test",
      },
    });

    return {
      success: true,
      message: "Razorpay connection successful",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Razorpay test failed: ${
        error.message || "Invalid credentials"
      }`,
    };
  }
}

async function testPayPal(
  config: any
): Promise<{ success: boolean; message: string }> {
  try {
    const mode = config.mode || "sandbox";
    const clientId = config[`${mode}ClientId`];
    const clientSecret = config[`${mode}ClientSecret`];

    if (!clientId || !clientSecret) {
      return {
        success: false,
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
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      return {
        success: false,
        message: "PayPal authentication failed - Invalid credentials",
      };
    }

    return {
      success: true,
      message: "PayPal connection successful",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `PayPal test failed: ${error.message || "Connection error"}`,
    };
  }
}

async function testStripe(
  config: any
): Promise<{ success: boolean; message: string }> {
  try {
    const mode = config.mode || "test";
    const secretKey = config[`${mode}SecretKey`];

    if (!secretKey) {
      return {
        success: false,
        message: "Stripe credentials not configured",
      };
    }

    // Test by fetching account details
    const response = await fetch("https://api.stripe.com/v1/balance", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Stripe authentication failed - Invalid credentials",
      };
    }

    return {
      success: true,
      message: "Stripe connection successful",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Stripe test failed: ${error.message || "Connection error"}`,
    };
  }
}
