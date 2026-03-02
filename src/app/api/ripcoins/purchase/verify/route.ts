/**
 * POST /api/ripcoins/purchase/verify
 *
 * Verifies a Razorpay payment and credits RipCoins to the user's wallet.
 * Idempotent — subsequent calls with the same razorpayOrderId are rejected.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository, ripcoinRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { ValidationError } from "@/lib/errors";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { RIPCOIN_PACK_SIZE, RIPCOIN_PACK_PRICE_RS } from "@/db/schema";
import { z } from "zod";

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  packs: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.FAILED);
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, packs } =
      validation.data;

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

    const coinsToCredit = packs * RIPCOIN_PACK_SIZE;
    const amountPaidRs = packs * RIPCOIN_PACK_PRICE_RS;

    // Fetch current balance to record ledger snapshot
    const userDoc = await userRepository.findById(user.uid);
    const balanceBefore = userDoc?.ripcoinBalance ?? 0;
    const balanceAfter = balanceBefore + coinsToCredit;

    // Credit coins — atomic increment on user document
    await userRepository.incrementRipCoinBalance(user.uid, coinsToCredit);

    // Record the purchase transaction in the ledger
    await ripcoinRepository.create({
      userId: user.uid,
      type: "purchase",
      coins: coinsToCredit,
      balanceBefore,
      balanceAfter,
      razorpayOrderId,
      razorpayPaymentId,
      amountPaid: amountPaidRs,
    });

    serverLogger.info("RipCoins purchase verified and credited", {
      uid: user.uid,
      packs,
      coinsToCredit,
      amountPaidRs,
      razorpayOrderId,
    });

    return successResponse(
      {
        coinsCredited: coinsToCredit,
        newBalance: balanceAfter,
      },
      SUCCESS_MESSAGES.RIPCOIN.PURCHASE_COMPLETE,
    );
  } catch (error) {
    serverLogger.error("POST /api/ripcoins/purchase/verify error", { error });
    return handleApiError(error);
  }
}
