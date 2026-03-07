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

import { z } from "zod";
import { createRazorpayOrder, rupeesToPaise } from "@/lib/payment/razorpay";
import { successResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";

const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
});

export const POST = createApiHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const { amount, currency, receipt } = body!;
    const amountInPaise = rupeesToPaise(amount);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt ?? `rcpt_${user!.uid}_${Date.now()}`,
      notes: { userId: user!.uid },
    });

    serverLogger.info(
      `Payment order created: ${razorpayOrder.id} for user ${user!.uid} — ₹${amount}`,
    );

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID ?? "",
    });
  },
});
