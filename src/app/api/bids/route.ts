/**
 * Bids API — Collection
 *
 * GET  /api/bids?productId=... — List bids for a product (public)
 * POST /api/bids              — Place a new bid (auth required)
 */

import { z } from "zod";
import { createApiHandler } from "@mohasinac/appkit";

import { bidRepository, productRepository, unitOfWork } from "@mohasinac/appkit";
import { getAdminRealtimeDb } from "@mohasinac/appkit";
import { BidStatusValues } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { maskPublicBid } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { getSearchParams, getStringParam } from "@mohasinac/appkit";
import { NotFoundError } from "@mohasinac/appkit";
import { resolveDate } from "@mohasinac/appkit";

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
    // Strip userEmail and mask userName for public response
    const sanitized = bids.map(({ userEmail: _strip, ...rest }) =>
      maskPublicBid(rest),
    );
    return successResponse(sanitized, undefined, 200, {
      total: sanitized.length,
    });
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

    // Find the user's existing active bid for this product
    const userPriorActiveBid = await bidRepository.findOneByProductAndUser(
      productId,
      user!.uid,
      BidStatusValues.ACTIVE,
    );

    // Create the bid
    const bid = await bidRepository.create({
      productId,
      productTitle: product.title,
      userId: user!.uid,
      userName:
        (typeof user!.displayName === "string" && user!.displayName.trim()) ||
        (typeof user!.email === "string" && user!.email.trim()) ||
        "Anonymous",
      userEmail: typeof user!.email === "string" ? user!.email : "",
      bidAmount,
      currency: product.currency || "INR",
      bidDate: new Date(),
      ...(autoMaxBid ? { autoMaxBid } : {}),
    });

    // Atomically: mark all previous bids for this product as outbid,
    // set this bid as the winner, and update the product's currentBid/bidCount.
    const allBids = await bidRepository.findBy("productId", productId);
    await unitOfWork.runBatch((batch) => {
      for (const b of allBids) {
        unitOfWork.bids.updateInBatch(batch, b.id, {
          isWinning: b.id === bid.id,
          status: b.id === bid.id ? BidStatusValues.ACTIVE : BidStatusValues.OUTBID,
        } as any);
      }
      unitOfWork.products.updateInBatch(batch, productId, {
        currentBid: bidAmount,
        bidCount: (product.bidCount ?? 0) + 1,
      } as any);
    });

    // ── Write to Realtime DB for live bid streaming ─────────────────
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
      // Non-fatal: RTDB write failure should not fail the bid placement
      serverLogger.warn("Failed to write bid to Realtime DB", {
        error: rtdbErr,
        productId,
      });
    }

    serverLogger.info("Bid placed", {
      bidId: bid.id,
      productId,
      userId: user!.uid,
      bidAmount,
    });

    return successResponse(bid, SUCCESS_MESSAGES.BID.PLACED, 201);
  },
});

