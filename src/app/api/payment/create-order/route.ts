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

    // Platform fee (our cut) + 18% GST on that fee, floored by per-transaction minimum.
    const siteSettings = await siteSettingsRepository.getSingleton();
    const platformFeePercent = siteSettings?.commissions?.platformFeePercent ?? 5;
    const gstPercent = siteSettings?.commissions?.gstPercent ?? 18;
    const minimumTransactionFee = Math.max(0, siteSettings?.commissions?.minimumTransactionFee ?? 0);

    const platformFee = Math.round(amount * (platformFeePercent / 100) * 100) / 100;
    const gstOnFee = Math.round(platformFee * (gstPercent / 100) * 100) / 100;
    const rawTotal = amount + platformFee + gstOnFee;
    // Floor: total charge must be at least amount + minimumTransactionFee.
    const totalAmount = Math.max(rawTotal, amount + minimumTransactionFee);

    const amountInPaise = rupeesToPaise(totalAmount);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt ?? `rcpt_${user!.uid}_${Date.now()}`,
      notes: { userId: user!.uid },
    });

    serverLogger.info(
      `Payment order created: ${razorpayOrder.id} for user ${user!.uid} — base ₹${amount} + fee ₹${platformFee} + GST ₹${gstOnFee} = ₹${totalAmount}`,
    );

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      platformFee,
      gstOnFee,
      baseAmount: amount,
    });
  },
}));

