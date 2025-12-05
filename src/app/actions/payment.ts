/**
 * @fileoverview TypeScript Module
 * @module src/app/actions/payment
 * @description This file contains functionality related to payment
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use server";

import { getAuthAdmin } from "@/app/api/lib/firebase/admin";
import { logError } from "@/lib/error-logger";
import { cookies } from "next/headers";
import { z } from "zod";

// Validation schemas
/**
 * Performs initiate payment schema operation
 *
 * @param {object} {
  
  amount - The {
  
  amount
 *
 * @returns {any} The initiatepaymentschema result
 *
 */
const initiatePaymentSchema = z.object({
  /** Amount */
  amount: z.number().positive("Amount must be positive"),
  /** Currency */
  currency: z
    .string()
    .length(3)
    .transform((val) => val.toUpperCase()),
  /** Gateway */
  gateway: z.enum(["razorpay", "paypal", "stripe"]),
  /** Order Id */
  orderId: z.string().min(1, "Order ID is required"),
  /** Metadata */
  metadata: z
    .object({
      /** Product Id */
      productId: z.string().optional(),
      /** Buyer Id */
      buyerId: z.string(),
      /** Seller Id */
      sellerId: z.string(),
      /** Description */
      description: z.string().optional(),
    })
    .optional(),
});

const verifyPaymentSchema = z.object({
  /** Gateway */
  gateway: z.enum(["razorpay", "paypal", "stripe"]),
  /** Order Id */
  orderId: z.string().min(1, "Order ID is required"),
  /** Payment Id */
  paymentId: z.string().min(1, "Payment ID is required"),
  signature: z.string().optional(), // Required for Razorpay, optional for others
  /** Metadata */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const refundPaymentSchema = z.object({
  /** Gateway */
  gateway: z.enum(["razorpay", "paypal", "stripe"]),
  /** Payment Id */
  paymentId: z.string().min(1, "Payment ID is required"),
  /** Amount */
  amount: z.number().positive("Refund amount must be positive").optional(),
  /** Reason */
  reason: z.string().optional(),
  /** Order Id */
  orderId: z.string().min(1, "Order ID is required"),
});

// Types
/**
 * InitiatePaymentInput type
 * 
 * @typedef {Object} InitiatePaymentInput
 * @description Type definition for InitiatePaymentInput
 */
type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
/**
 * VerifyPaymentInput type
 * 
 * @typedef {Object} VerifyPaymentInput
 * @description Type definition for VerifyPaymentInput
 */
type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
/**
 * RefundPaymentInput type
 * 
 * @typedef {Object} RefundPaymentInput
 * @description Type definition for RefundPaymentInput
 */
type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

/**
 * PaymentResult interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentResult
 */
interface PaymentResult {
  /** Success */
  success: boolean;
  /** Data */
  data?: unknown;
  /** Error */
  error?: string;
}

/**
 * Get current authenticated user from session
 */
/**
 * Retrieves current user
 *
 * @returns {Promise<any>} Promise resolving to currentuser result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Retrieves current user
 *
 * @returns {Promise<any>} Promise resolving to currentuser result
 *
 * @throws {Error} When operation fails or validation errors occur
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
/**
 * Performs initiate payment operation
 *
 * @param {InitiatePaymentInput} input - The input
 *
 * @returns {Promise<any>} Promise resolving to initiatepayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * initiatePayment(input);
 */

/**
 * Performs initiate payment operation
 *
 * @param {InitiatePaymentInput} /** Input */
  input - The /**  input */
  input
 *
 * @returns {Promise<any>} Promise resolving to initiatepayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * initiatePayment(/** Input */
  input);
 */

/**
 * Performs initiate payment operation
 *
 * @param {InitiatePaymentInput} input - The input
 *
 * @returns {Promise<PaymentResult>} The initiatepayment result
 *
 * @example
 * initiatePayment(input);
 */
export async function initiatePayment(
  /** Input */
  input: InitiatePaymentInput
): Promise<PaymentResult> {
  try {
    // Validate input
    const validatedInput = initiatePaymentSchema.parse(input);

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        /** Success */
        success: false,
        /** Error */
        error: "Authentication required",
      };
    }

    // Verify user is the buyer
    if (validatedInput.metadata?.buyerId !== user.uid) {
      return {
        /** Success */
        success: false,
        /** Error */
        error: "Unauthorized: User mismatch",
      };
    }

    // Call appropriate payment gateway API
    const apiEndpoint = `/api/payments/${validatedInput.gateway}/order`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${apiEndpoint}`,
      {
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
        },
        /** Body */
        body: JSON.stringify({
          /** Amount */
          amount: validatedInput.amount,
          /** Currency */
          currency: validatedInput.currency,
          /** Order Id */
          orderId: validatedInput.orderId,
          /** Metadata */
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
      /** Success */
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "initiatePayment",
      /** Metadata */
      metadata: { input },
    });

    return {
      /** Success */
      success: false,
      /** Error */
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
/**
 * Performs verify payment operation
 *
 * @param {VerifyPaymentInput} input - The input
 *
 * @returns {Promise<any>} Promise resolving to verifypayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * verifyPayment(input);
 */

/**
 * Performs verify payment operation
 *
 * @param {VerifyPaymentInput} /** Input */
  input - The /**  input */
/**
 * Performs verify payment operation
 *
 * @param {VerifyPaymentInput} input - The input
 *
 * @returns {Promise<PaymentResult>} The verifypayment result
 *
 * @example
 * verifyPayment(input);
 */
  input
 *
 * @returns {Promise<any>} Promise resolving to verifypayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * verifyPayment(/** Input */
  input);
 */

export async function verifyPayment(
  /** Input */
  input: VerifyPaymentInput
): Promise<PaymentResult> {
  try {
    // Validate input
    const validatedInput = verifyPaymentSchema.parse(input);

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        /** Success */
        success: false,
        /** Error */
        error: "Authentication required",
      };
    }

    // Razorpay requires signature verification
    if (validatedInput.gateway === "razorpay" && !validatedInput.signature) {
      return {
        /** Success */
        success: false,
        /** Error */
        error: "Payment signature is required for Razorpay",
      };
    }

    // Call appropriate payment gateway verification API
    const apiEndpoint = `/api/payments/${validatedInput.gateway}/verify`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}${apiEndpoint}`,
      {
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
        },
        /** Body */
        body: JSON.stringify({
          /** Order Id */
          orderId: validatedInput.orderId,
          /** Payment Id */
          paymentId: validatedInput.paymentId,
          /** Signature */
          signature: validatedInput.signature,
          /** Metadata */
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
      /** Success */
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "verifyPayment",
      /** Metadata */
      metadata: { input },
    });

    return {
      /** Success */
      success: false,
      /** Error */
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
/**
 * Performs refund payment operation
 *
 * @param {RefundPaymentInput} input - The input
 *
 * @returns {Promise<any>} Promise resolving to refundpayment result
 *
 * @throws {Error} When op/**
 * Performs refund payment operation
 *
 * @param {RefundPaymentInput} input - The input
 *
 * @returns {Promise<PaymentResult>} The refundpayment result
 *
 * @example
 * refundPayment(input);
 */
eration fails or validation errors occur
 *
 * @example
 * refundPayment(input);
 */

/**
 * Performs refund payment operation
 *
 * @param {RefundPaymentInput} /** Input */
  input - The /**  input */
  input
 *
 * @returns {Promise<any>} Promise resolving to refundpayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * refundPayment(/** Input */
  input);
 */

export async function refundPayment(
  /** Input */
  input: RefundPaymentInput
): Promise<PaymentResult> {
  try {
    // Validate input
    const validatedInput = refundPaymentSchema.parse(input);

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        /** Success */
        success: false,
        /** Error */
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
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
        },
        /** Body */
        body: JSON.stringify({
          /** Payment Id */
          paymentId: validatedInput.paymentId,
          /** Amount */
          amount: validatedInput.amount,
          /** Reason */
          reason: validatedInput.reason,
          /** Order Id */
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
      /** Success */
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "refundPayment",
      /** Metadata */
      metadata: { input },
    });

    return {
      /** Success */
      success: false,
      /** Error */
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
/**
 * Retrieves available gateways
 *
 * @param {string} [country] - The country
 * @param {string} [currency] - The currency
 *
 * @returns {Promise<any>} Promise resolving to availablegateways result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAvailableGateways("example", "example");
 */

/**
 * Retrieves available gateways
 *
 * @returns {Promise<any>} Promise resolving to availablegateways result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAvailableGateways();
 */

export async function getAvailableGateways(
  /** Country */
  country?: string,
  /** Currency */
  currency?: string
): Promise<PaymentResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        /** Success */
        success: false,
        /** Error */
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
        /** Method */
        method: "GET",
        /** Headers */
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
      /** Success */
      success: true,
      data,
    };
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "getAvailableGateways",
      /** Metadata */
      metadata: { country, currency },
    });

    return {
      /** Success */
      success: false,
      /** Error */
      error:
        error instanceof Error ? error.message : "Failed to fetch gateways",
    };
  }
}
