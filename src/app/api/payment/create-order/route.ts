/**
 * Payment - Create Razorpay Order
 *
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order on the server side.
 * The order ID is required to initiate the Razorpay checkout modal on the client.
 *
 * Body: { amount: number (in rupees), currency?: string, receipt?: string }
 * Returns: { razorpayOrderId, amount (paise), currency, keyId }
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { createRazorpayOrder, rupeesToPaise } from "@/lib/payment/razorpay";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";

const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const { amount, currency, receipt } = validation.data;
    const amountInPaise = rupeesToPaise(amount);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt ?? `rcpt_${user.uid}_${Date.now()}`,
      notes: { userId: user.uid },
    });

    serverLogger.info(
      `Payment order created: ${razorpayOrder.id} for user ${user.uid} — ₹${amount}`,
    );

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID ?? "",
    });
  } catch (error) {
    serverLogger.error("POST /api/payment/create-order error:", error);
    return handleApiError(error);
  }
}
