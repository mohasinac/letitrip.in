"use server";

import { getAuthAdmin } from "@/app/api/lib/firebase/admin";
import { logError } from "@/lib/error-logger";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schemas
const initiatePaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z
    .string()
    .length(3)
    .transform((val) => val.toUpperCase()),
  gateway: z.enum(["razorpay", "paypal", "stripe"]),
  orderId: z.string().min(1, "Order ID is required"),
  metadata: z
    .object({
      productId: z.string().optional(),
      buyerId: z.string(),
      sellerId: z.string(),
      description: z.string().optional(),
    })
    .optional(),
});

const verifyPaymentSchema = z.object({
  gateway: z.enum(["razorpay", "paypal", "stripe"]),
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().min(1, "Payment ID is required"),
  signature: z.string().optional(), // Required for Razorpay, optional for others
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const refundPaymentSchema = z.object({
  gateway: z.enum(["razorpay", "paypal", "stripe"]),
  paymentId: z.string().min(1, "Payment ID is required"),
  amount: z.number().positive("Refund amount must be positive").optional(),
  reason: z.string().optional(),
  orderId: z.string().min(1, "Order ID is required"),
});

// Types
type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

interface PaymentResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Get current authenticated user from session
 */
async function getCurrentUser(): Promise<{ uid: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    const adminAuth = getAuthAdmin();
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie.value,
      true
    );
    return { uid: decodedClaims.uid };
  } catch (error) {
    logError(error as Error, { component: "getCurrentUser" });
    return null;
  }
}

/**
 * Server action to initiate a payment
 * Validates input, checks authentication, and creates payment order
 */
export async function initiatePayment(
  input: InitiatePaymentInput
): Promise<PaymentResult> {
  try {
    // Validate input
    const validatedInput = initiatePaymentSchema.parse(input);

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Verify user is the buyer
    if (validatedInput.metadata?.buyerId !== user.uid) {
      return {
        success: false,
        error: "Unauthorized: User mismatch",
      };
    }

    // Call appropriate payment gateway API
    const apiEndpoint = `/api/payments/${validatedInput.gateway}/order`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${apiEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: validatedInput.amount,
          currency: validatedInput.currency,
          orderId: validatedInput.orderId,
          metadata: validatedInput.metadata,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Payment initiation failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      component: "initiatePayment",
      metadata: { input },
    });

    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.issues[0].message
          : error instanceof Error
          ? error.message
          : "Failed to initiate payment",
    };
  }
}

/**
 * Server action to verify a payment
 * Validates payment signature/confirmation and updates order status
 */
export async function verifyPayment(
  input: VerifyPaymentInput
): Promise<PaymentResult> {
  try {
    // Validate input
    const validatedInput = verifyPaymentSchema.parse(input);

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Razorpay requires signature verification
    if (validatedInput.gateway === "razorpay" && !validatedInput.signature) {
      return {
        success: false,
        error: "Payment signature is required for Razorpay",
      };
    }

    // Call appropriate payment gateway verification API
    const apiEndpoint = `/api/payments/${validatedInput.gateway}/verify`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${apiEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: validatedInput.orderId,
          paymentId: validatedInput.paymentId,
          signature: validatedInput.signature,
          metadata: validatedInput.metadata,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Payment verification failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      component: "verifyPayment",
      metadata: { input },
    });

    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.issues[0].message
          : error instanceof Error
          ? error.message
          : "Failed to verify payment",
    };
  }
}

/**
 * Server action to initiate a payment refund
 * Validates input, checks authorization, and processes refund
 */
export async function refundPayment(
  input: RefundPaymentInput
): Promise<PaymentResult> {
  try {
    // Validate input
    const validatedInput = refundPaymentSchema.parse(input);

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Verify order ownership (seller or admin)
    // This would typically involve fetching the order from Firestore
    // For now, we'll make the API call and let it handle authorization
    const apiEndpoint = `/api/payments/${validatedInput.gateway}/refund`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${apiEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: validatedInput.paymentId,
          amount: validatedInput.amount,
          reason: validatedInput.reason,
          orderId: validatedInput.orderId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Refund failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      component: "refundPayment",
      metadata: { input },
    });

    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? error.issues[0].message
          : error instanceof Error
          ? error.message
          : "Failed to process refund",
    };
  }
}

/**
 * Server action to get available payment gateways
 * Returns list of enabled gateways for the current country/currency
 */
export async function getAvailableGateways(
  country?: string,
  currency?: string
): Promise<PaymentResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (currency) params.append("currency", currency);

    const apiEndpoint = `/api/payments/available-gateways?${params.toString()}`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${apiEndpoint}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to fetch gateways: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      component: "getAvailableGateways",
      metadata: { country, currency },
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch gateways",
    };
  }
}
