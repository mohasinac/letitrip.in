"use server";

/**
 * Bid Server Actions
 *
 * Place auction bids — calls repositories directly, bypassing the
 * service → apiClient → API route chain.
 *
 * Business rules are identical to POST /api/bids but execute server-side
 * with no HTTP overhead.
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import {
  bidRepository,
  productRepository,
  unitOfWork,
  userRepository,
} from "@/repositories";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import type { BidDocument } from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@/lib/query";
import { resolveDate } from "@/utils";
import { maskPublicBid } from "@/lib/pii";

// ─── Validation schema ─────────────────────────────────────────────────────

const placeBidSchema = z.object({
  productId: z.string().min(1),
  bidAmount: z.number().positive(),
  autoMaxBid: z.number().positive().optional(),
});

export type PlaceBidInput = z.infer<typeof placeBidSchema>;

export interface PlaceBidResult {
  bid: BidDocument;
}

// ─── Server Action ─────────────────────────────────────────────────────────

/**
 * Place a bid on an auction product.
 *
 * Validates ownership, timing, and bid amount before
 * atomically recording the bid, updating the product, and writing to RTDB.
 */
export async function placeBidAction(
  input: PlaceBidInput,
): Promise<PlaceBidResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `bid:place:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = placeBidSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid bid data",
    );
  }

  const { productId, bidAmount, autoMaxBid } = parsed.data;

  // ── Fetch and validate the product ───────────────────────────────────────
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new NotFoundError(ERROR_MESSAGES.BID.AUCTION_NOT_FOUND);
  }

  if (!product.isAuction) {
    throw new ValidationError(ERROR_MESSAGES.BID.NOT_AN_AUCTION);
  }

  if (product.auctionEndDate) {
    const endDate = resolveDate(product.auctionEndDate);
    if (endDate && endDate.getTime() < Date.now()) {
      throw new ValidationError(ERROR_MESSAGES.BID.AUCTION_ENDED);
    }
  }

  if (product.sellerId === user.uid) {
    throw new AuthorizationError(ERROR_MESSAGES.BID.OWN_AUCTION);
  }

  // ── Bid-amount validation ─────────────────────────────────────────────────
  const minimumBid =
    (product.currentBid ?? 0) > 0
      ? product.currentBid!
      : (product.startingBid ?? product.price);

  if (bidAmount <= minimumBid) {
    throw new ValidationError(ERROR_MESSAGES.BID.BID_TOO_LOW);
  }

  // Find the user's existing active bid for this product
  const userPriorActiveBid = (
    await bidRepository.findBy("productId", productId)
  ).find((b) => b.userId === user.uid && b.status === "active");

  // ── Create the bid ────────────────────────────────────────────────────────
  const profile = await userRepository.findById(user.uid);
  const bid = await bidRepository.create({
    productId,
    productTitle: product.title,
    userId: user.uid,
    userName: profile?.displayName ?? user.email ?? "Anonymous",
    userEmail: profile?.email ?? user.email ?? "",
    bidAmount,
    currency: product.currency || "INR",
    bidDate: new Date(),
    ...(autoMaxBid ? { autoMaxBid } : {}),
  });

  // ── Atomically mark all previous bids outbid + update product ────────────
  const allBids = await bidRepository.findBy("productId", productId);
  await unitOfWork.runBatch((batch) => {
    for (const b of allBids) {
      unitOfWork.bids.updateInBatch(batch, b.id, {
        isWinning: b.id === bid.id,
        status: b.id === bid.id ? "active" : "outbid",
      } as any);
    }
    unitOfWork.products.updateInBatch(batch, productId, {
      currentBid: bidAmount,
      bidCount: (product.bidCount ?? 0) + 1,
    } as any);
  });

  // ── Write to Realtime DB for live bid streaming ───────────────────────────
  try {
    const rtdb = getAdminRealtimeDb();
    await rtdb.ref(`/auction-bids/${productId}`).set({
      currentBid: bidAmount,
      bidCount: (product.bidCount ?? 0) + 1,
      lastBid: {
        amount: bidAmount,
        bidderName: "Bidder",
        timestamp: Date.now(),
      },
      updatedAt: Date.now(),
    });
  } catch (rtdbErr) {
    // Non-fatal: RTDB write failure must not fail the bid placement
    serverLogger.warn("placeBidAction: RTDB write failed", {
      error: rtdbErr,
      productId,
    });
  }

  serverLogger.info("placeBidAction: bid placed", {
    bidId: bid.id,
    productId,
    userId: user.uid,
    bidAmount,
  });

  return { bid };
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listBidsByProductAction(
  productId: string,
  params?: { page?: number; pageSize?: number },
): Promise<FirebaseSieveResult<Omit<BidDocument, "userEmail">>> {
  const result = await bidRepository.list({
    filters: `productId==${productId}`,
    sorts: "-bidAmount",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  });
  return {
    ...result,
    items: result.items.map(({ userEmail: _strip, ...rest }) =>
      maskPublicBid(rest),
    ),
  };
}

export async function getBidByIdAction(
  id: string,
): Promise<BidDocument | null> {
  return bidRepository.findById(id);
}
