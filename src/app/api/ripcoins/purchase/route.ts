/**
 * POST /api/ripcoins/purchase
 *
 * Initiates a RipCoin purchase via Razorpay.
 * User selects one of the fixed packages (100, 500, 1000, 5000, 10000 coins).
 * Returns a Razorpay order to be processed on the client.
 */

import { successResponse, errorResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createRazorpayOrder, rupeesToPaise } from "@/lib/payment/razorpay";
import { VALID_PACKAGE_IDS, getRipCoinPackage } from "@/db/schema";
import { z } from "zod";

const purchaseSchema = z.object({
  packageId: z.string().refine((v) => VALID_PACKAGE_IDS.includes(v), {
    message: ERROR_MESSAGES.RIPCOIN.INVALID_PACKAGE,
  }),
});

export const POST = createApiHandler<(typeof purchaseSchema)["_output"]>({
  auth: true,
  schema: purchaseSchema,
  handler: async ({ user, body }) => {
    const pkg = getRipCoinPackage(body!.packageId);
    if (!pkg) {
      return errorResponse(ERROR_MESSAGES.RIPCOIN.INVALID_PACKAGE, 400);
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: rupeesToPaise(pkg.priceRs),
      currency: "INR",
      receipt: `rc_${user!.uid}_${Date.now()}`,
      notes: {
        userId: user!.uid,
        packageId: pkg.packageId,
        coins: String(pkg.coins),
        bonusCoins: String(pkg.bonusCoins),
        totalCoins: String(pkg.totalCoins),
        type: "ripcoin_purchase",
      },
    });

    serverLogger.info("RipCoin purchase initiated", {
      uid: user!.uid,
      packageId: pkg.packageId,
      totalCoins: pkg.totalCoins,
      amountRs: pkg.priceRs,
      razorpayOrderId: razorpayOrder.id,
    });

    return successResponse(
      {
        razorpayOrderId: razorpayOrder.id,
        amountRs: pkg.priceRs,
        coins: pkg.coins,
        bonusCoins: pkg.bonusCoins,
        totalCoins: pkg.totalCoins,
        packageId: pkg.packageId,
        currency: "INR",
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      },
      SUCCESS_MESSAGES.RIPCOIN.PURCHASE_INITIATED,
    );
  },
});
