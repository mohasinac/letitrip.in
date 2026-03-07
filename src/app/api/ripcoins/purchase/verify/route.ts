/**
 * POST /api/ripcoins/purchase/verify
 *
 * Verifies a Razorpay payment and credits RipCoins (base + bonus) to the user's wallet.
 * Idempotent — subsequent calls with the same razorpayOrderId are rejected.
 */

import { userRepository, ripcoinRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { getRipCoinPackage } from "@/db/schema";
import { z } from "zod";

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  packageId: z.string().min(1),
});

export const POST = createApiHandler<(typeof verifySchema)["_output"]>({
  auth: true,
  schema: verifySchema,
  handler: async ({ user, body }) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, packageId } =
      body!;

    // Idempotency check — reject duplicate verifications
    const existing =
      await ripcoinRepository.findByRazorpayOrderId(razorpayOrderId);
    if (existing) {
      return errorResponse(ERROR_MESSAGES.RIPCOIN.PAYMENT_ALREADY_USED, 409);
    }

    // Verify HMAC signature from Razorpay
    const isValid = verifyPaymentSignature({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    });

    if (!isValid) {
      return errorResponse(ERROR_MESSAGES.RIPCOIN.VERIFY_FAILED, 400);
    }

    const pkg = getRipCoinPackage(packageId);
    if (!pkg) {
      return errorResponse(ERROR_MESSAGES.RIPCOIN.INVALID_PACKAGE, 400);
    }

    const coinsToCredit = pkg.totalCoins; // base + bonus

    // Fetch current balance to record ledger snapshot
    const userDoc = await userRepository.findById(user!.uid);
    const balanceBefore = userDoc?.ripcoinBalance ?? 0;
    const balanceAfter = balanceBefore + coinsToCredit;

    // Credit coins — atomic increment on user document
    await userRepository.incrementRipCoinBalance(user!.uid, coinsToCredit);

    // Record the purchase transaction in the ledger
    await ripcoinRepository.create({
      userId: user!.uid,
      type: "purchase",
      coins: coinsToCredit,
      balanceBefore,
      balanceAfter,
      razorpayOrderId,
      razorpayPaymentId,
      amountPaid: pkg.priceRs,
      packageId: pkg.packageId,
      bonusCoins: pkg.bonusCoins,
    });

    serverLogger.info("RipCoins purchase verified and credited", {
      uid: user!.uid,
      packageId,
      coinsToCredit,
      bonusCoins: pkg.bonusCoins,
      amountPaidRs: pkg.priceRs,
      razorpayOrderId,
    });

    return successResponse(
      {
        coinsCredited: coinsToCredit,
        bonusCoins: pkg.bonusCoins,
        newBalance: balanceAfter,
      },
      SUCCESS_MESSAGES.RIPCOIN.PURCHASE_COMPLETE,
    );
  },
});
