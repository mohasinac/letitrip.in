/**
 * Bids API — Collection
 *
 * GET  /api/bids?productId=... — List bids for a product (public)
 * POST /api/bids              — Place a new bid (auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { bidRepository, productRepository, unitOfWork } from "@/repositories";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { getSearchParams, getStringParam } from "@/lib/api/request-helpers";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { z } from "zod";

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
export async function GET(request: NextRequest) {
  try {
    const searchParams = getSearchParams(request);
    const productId = getStringParam(searchParams, "productId");

    if (!productId) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400);
    }

    const bids = await bidRepository.findByProductSorted(productId);

    return NextResponse.json(
      {
        success: true,
        data: bids,
        meta: { total: bids.length },
      },
      { status: 200 },
    );
  } catch (error) {
    serverLogger.error("GET /api/bids error", { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/bids
 *
 * Place a bid on an auction product.
 * - Auth required
 * - bidAmount must exceed current highest bid (or starting bid)
 * - Cannot bid on own auction
 * - Auction must not have ended
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = placeBidSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.FAILED);
    }

    const { productId, bidAmount, autoMaxBid } = validation.data;

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
      const endDate =
        product.auctionEndDate instanceof Date
          ? product.auctionEndDate
          : new Date(product.auctionEndDate as unknown as string);
      if (endDate.getTime() < Date.now()) {
        return errorResponse(ERROR_MESSAGES.BID.AUCTION_ENDED, 400);
      }
    }

    // Cannot bid on own auction
    if (product.sellerId === user.uid) {
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

    // Create the bid
    const bid = await bidRepository.create({
      productId,
      productTitle: product.title,
      userId: user.uid,
      userName: user.name ?? user.email ?? "Anonymous",
      userEmail: user.email ?? "",
      bidAmount,
      currency: product.currency || "INR",
      bidDate: new Date(),
      ...(autoMaxBid ? { autoMaxBid } : {}),
    });

    // Atomically: mark all previous bids for this product as outbid,
    // set this bid as the winner, and update the product's currentBid/bidCount.
    // (Replaces the separate setWinningBid + productRepository.update calls)
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

    serverLogger.info("Bid placed", {
      bidId: bid.id,
      productId,
      userId: user.uid,
      bidAmount,
    });

    return successResponse(bid, SUCCESS_MESSAGES.BID.PLACED, 201);
  } catch (error) {
    serverLogger.error("POST /api/bids error", { error });
    return handleApiError(error);
  }
}
