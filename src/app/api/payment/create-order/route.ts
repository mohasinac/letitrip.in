import { withProviders } from "@/providers.config";
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
import { createRazorpayOrder, rupeesToPaise } from "@mohasinac/appkit";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { getDefaultCurrency } from "@mohasinac/appkit";

const createOrderSchema = z.object({
  amount: z.number().nonnegative("Amount cannot be negative"),
  currency: z.string().default(getDefaultCurrency()),
  receipt: z.string().optional(),
});

export const POST = withProviders(createRouteHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) throw ApiErrors.internalError("Razorpay is not configured on this server");

    const { amount, currency, receipt } = body!;

    // Apply Razorpay processing fee from site settings (default 5%).
    const siteSettings = await siteSettingsRepository.getSingleton();
    const razorpayFeePercent =
      siteSettings?.commissions?.razorpayFeePercent ?? 5;
    const minimumOrderFee = Math.max(0, siteSettings?.commissions?.minimumOrderFee ?? 0);

    const rawFee = amount * (razorpayFeePercent / 100);
    if (rawFee < 0) throw ApiErrors.badRequest("Platform fee cannot be negative");
    const platformFee = Math.round(rawFee * 100) / 100;

    // Enforce minimum order amount (after fee). If both subtotal and fee are 0
    // but minimumOrderFee > 0, the user still pays the minimum.
    const rawTotal = amount + platformFee;
    const totalAmount = Math.max(rawTotal, minimumOrderFee);

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
      keyId,
      platformFee,
      baseAmount: amount,
    });
  },
}));

