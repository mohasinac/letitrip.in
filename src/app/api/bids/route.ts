/**
 * Bids API — Collection
 *
 * GET  /api/bids?productId=... — List bids for a product (public)
 * POST /api/bids              — Place a new bid (auth required)
 */

import {
  bidRepository,
  productRepository,
  unitOfWork,
  userRepository,
  ripcoinRepository,
} from "@/repositories";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { getSearchParams, getStringParam } from "@/lib/api/request-helpers";
import { NotFoundError } from "@/lib/errors";
import { resolveDate } from "@/utils";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";

const placeBidSchema = z.object({
  productId: z.string().min(1),
  bidAmount: z.number().positive(),
  autoMaxBid: z.number().positive().optional(),
});

/**
 * GET /api/bids?productId=...
 *
 * Returns all bids for a given auction product, sorted by bidAmount desc.
 */
export const GET = createApiHandler({
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const productId = getStringParam(searchParams, "productId");
    if (!productId) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400);
    }
    const bids = await bidRepository.findByProductSorted(productId);
    return successResponse(bids, undefined, 200, { total: bids.length });
  },
});

/**
 * POST /api/bids
 *
 * Place a bid on an auction product.
 * - Auth required
 * - bidAmount must exceed current highest bid (or starting bid)
 * - Cannot bid on own auction
 * - Auction must not have ended
 * - User must have enough RipCoins (1 RipCoin = ₹1 bid value)
 */
export const POST = createApiHandler<(typeof placeBidSchema)["_output"]>({
  auth: true,
  schema: placeBidSchema,
  handler: async ({ user, body }) => {
    const { productId, bidAmount, autoMaxBid } = body!;

    // Fetch the product
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.BID.AUCTION_NOT_FOUND);
    }

    // Must be an auction
    if (!product.isAuction) {
      return errorResponse(ERROR_MESSAGES.BID.NOT_AN_AUCTION, 400);
    }

    // Auction must not have ended
    if (product.auctionEndDate) {
      const endDate = resolveDate(product.auctionEndDate);
      if (endDate && endDate.getTime() < Date.now()) {
        return errorResponse(ERROR_MESSAGES.BID.AUCTION_ENDED, 400);
      }
    }

    // Cannot bid on own auction
    if (product.sellerId === user!.uid) {
      return errorResponse(ERROR_MESSAGES.BID.OWN_AUCTION, 403);
    }

    // Bid must exceed current bid (or starting bid if no bids yet)
    const minimumBid =
      (product.currentBid ?? 0) > 0
        ? product.currentBid!
        : (product.startingBid ?? product.price);

    if (bidAmount <= minimumBid) {
      return errorResponse(ERROR_MESSAGES.BID.BID_TOO_LOW, 400);
    }

    // ── RipCoin balance check ──────────────────────────────────────────────
    // 1 RipCoin = ₹1 bid value; user must hold at least bidAmount free coins.
    const userDoc = await userRepository.findById(user!.uid);
    const freeCoins =
      (userDoc?.ripcoinBalance ?? 0) - (userDoc?.engagedRipcoins ?? 0);
    if (freeCoins < bidAmount) {
      return errorResponse(ERROR_MESSAGES.RIPCOIN.INSUFFICIENT_COINS, 402);
    }

    // Find the user's existing active bid for this product (coins may need releasing)
    const userPriorActiveBid = (
      await bidRepository.findBy("productId", productId)
    ).find((b) => b.userId === user!.uid && b.status === "active");

    // Create the bid
    const bid = await bidRepository.create({
      productId,
      productTitle: product.title,
      userId: user!.uid,
      userName: user!.displayName ?? user!.email ?? "Anonymous",
      userEmail: user!.email ?? "",
      bidAmount,
      currency: product.currency || "INR",
      bidDate: new Date(),
      engagedCoins: bidAmount,
      coinsStatus: "engaged",
      ...(autoMaxBid ? { autoMaxBid } : {}),
    });

    // Atomically: mark all previous bids for this product as outbid,
    // set this bid as the winner, and update the product's currentBid/bidCount.
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

    // ── RipCoin atomic balance update ─────────────────────────────────────
    // (a) Engage coins for the new bid: debit free balance, credit engaged pool
    await userRepository.incrementRipCoinBalance(
      user!.uid,
      -bidAmount,
      bidAmount,
    );

    // (b) Release coins for any previous active bid from this user on this product
    if (userPriorActiveBid?.engagedCoins) {
      const released = userPriorActiveBid.engagedCoins;
      await userRepository.incrementRipCoinBalance(
        user!.uid,
        released,
        -released,
      );

      // Update the outbid bid record and record ledger entry
      await bidRepository.update(userPriorActiveBid.id, {
        coinsStatus: "released",
      } as any);

      const priorUserDoc = await userRepository.findById(user!.uid);
      await ripcoinRepository.create({
        userId: user!.uid,
        type: "release",
        coins: released,
        balanceBefore: (priorUserDoc?.ripcoinBalance ?? 0) - released,
        balanceAfter: priorUserDoc?.ripcoinBalance ?? 0,
        bidId: userPriorActiveBid.id,
        productId,
        productTitle: product.title,
        bidAmount: userPriorActiveBid.bidAmount,
        notes: "Outbid — coins released",
      });
    }

    // Record "engage" transaction for the new bid
    const freshUserDoc = await userRepository.findById(user!.uid);
    await ripcoinRepository.create({
      userId: user!.uid,
      type: "engage",
      coins: bidAmount,
      balanceBefore: (freshUserDoc?.ripcoinBalance ?? 0) + bidAmount,
      balanceAfter: freshUserDoc?.ripcoinBalance ?? 0,
      bidId: bid.id,
      productId,
      productTitle: product.title,
      bidAmount,
      notes: "Coins locked for bid",
    });

    // Write to Realtime DB for live bid streaming
    try {
      const rtdb = getAdminRealtimeDb();
      await rtdb.ref(`/auction-bids/${productId}`).set({
        currentBid: bidAmount,
        bidCount: (product.bidCount ?? 0) + 1,
        lastBid: {
          amount: bidAmount,
          bidderName: bid.userName?.split(" ")[0] ?? "Bidder",
          timestamp: Date.now(),
        },
        updatedAt: Date.now(),
      });
    } catch (rtdbErr) {
      // Non-fatal: RTDB write failure should not fail the bid placement
      serverLogger.warn("Failed to write bid to Realtime DB", {
        error: rtdbErr,
        productId,
      });
    }

    serverLogger.info("Bid placed with RipCoins engaged", {
      bidId: bid.id,
      productId,
      userId: user!.uid,
      bidAmount,
      engagedCoins: bidAmount,
    });

    return successResponse(bid, SUCCESS_MESSAGES.BID.PLACED, 201);
  },
});
