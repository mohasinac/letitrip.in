import "@/providers.config";
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
import { createRazorpayOrder, rupeesToPaise } from "@mohasinac/appkit/server";
import { siteSettingsRepository } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";
import { getDefaultCurrency } from "@mohasinac/appkit/server";

const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default(getDefaultCurrency()),
  receipt: z.string().optional(),
});

export const POST = createRouteHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const { amount, currency, receipt } = body!;

    // Apply Razorpay processing fee from site settings (default 5%).
    const siteSettings = await siteSettingsRepository.getSingleton();
    const razorpayFeePercent =
      siteSettings?.commissions?.razorpayFeePercent ?? 5;
    const platformFee =
      Math.round(amount * (razorpayFeePercent / 100) * 100) / 100;
    const totalAmount = amount + platformFee;

    const amountInPaise = rupeesToPaise(totalAmount);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt ?? `rcpt_${user!.uid}_${Date.now()}`,
      notes: { userId: user!.uid },
    });

    serverLogger.info(
      `Payment order created: ${razorpayOrder.id} for user ${user!.uid} — base ₹${amount} + fee ₹${platformFee} = ₹${totalAmount}`,
    );

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID ?? "",
      platformFee,
      baseAmount: amount,
    });
  },
});

