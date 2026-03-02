/**
 * POST /api/ripcoins/purchase
 *
 * Initiates a RipCoin purchase via Razorpay.
 * User selects how many packs (1 pack = 10 coins = ₹1).
 * Returns a Razorpay order to be processed on the client.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { ValidationError } from "@/lib/errors";
import { createRazorpayOrder, rupeesToPaise } from "@/lib/payment/razorpay";
import {
  RIPCOIN_MIN_PACKS,
  RIPCOIN_MAX_PACKS,
  RIPCOIN_PACK_PRICE_RS,
  RIPCOIN_PACK_SIZE,
} from "@/db/schema";
import { z } from "zod";

const purchaseSchema = z.object({
  packs: z
    .number()
    .int()
    .min(RIPCOIN_MIN_PACKS, ERROR_MESSAGES.RIPCOIN.INVALID_PACK_COUNT)
    .max(RIPCOIN_MAX_PACKS, ERROR_MESSAGES.RIPCOIN.INVALID_PACK_COUNT),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = purchaseSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(ERROR_MESSAGES.RIPCOIN.INVALID_PACK_COUNT);
    }

    const { packs } = validation.data;
    const amountRs = packs * RIPCOIN_PACK_PRICE_RS;
    const coinsToBuy = packs * RIPCOIN_PACK_SIZE;

    const razorpayOrder = await createRazorpayOrder({
      amount: rupeesToPaise(amountRs),
      currency: "INR",
      receipt: `rc_${user.uid}_${Date.now()}`,
      notes: {
        userId: user.uid,
        packs: String(packs),
        coins: String(coinsToBuy),
        type: "ripcoin_purchase",
      },
    });

    serverLogger.info("RipCoin purchase initiated", {
      uid: user.uid,
      packs,
      coinsToBuy,
      amountRs,
      razorpayOrderId: razorpayOrder.id,
    });

    return successResponse(
      {
        razorpayOrderId: razorpayOrder.id,
        amountRs,
        coinsToBuy,
        packs,
        currency: "INR",
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      },
      SUCCESS_MESSAGES.RIPCOIN.PURCHASE_INITIATED,
    );
  } catch (error) {
    serverLogger.error("POST /api/ripcoins/purchase error", { error });
    return handleApiError(error);
  }
}
