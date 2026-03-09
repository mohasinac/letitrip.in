/**
 * Trigger: onBidPlaced
 *
 * Fires whenever a new bid document is created in the `bids` collection.
 *
 * What it does:
 *   1. Finds the previous highest `active` bid for the same productId
 *      (if it belongs to a different user) and marks it `outbid`.
 *   2. Sets `isWinning = true` on the new bid (highest), and
 *      `isWinning = false` on the previously winning bid.
 *   3. Updates the product's `currentBid` and `bidCount` counters.
 *   4. Writes a `bid_outbid` Firestore notification for the displaced bidder.
 *   5. Pushes a real-time alert to `notifications/{uid}` in Realtime DB.
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db, getRtdb } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";
import {
  bidRepository,
  productRepository,
  notificationRepository,
} from "../repositories";
import { BID_MESSAGES } from "../constants/messages";

const TRIGGER = "onBidPlaced";

export const onBidPlaced = onDocumentCreated(
  {
    document: `${COLLECTIONS.BIDS}/{bidId}`,
    region: REGION,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logError(TRIGGER, "No snapshot data", null);
      return;
    }

    const newBid = snap.data() as {
      id: string;
      productId: string;
      productTitle: string;
      userId: string;
      userName: string;
      bidAmount: number;
      currency: string;
    };

    try {
      // ── Find the previous winning bid for this product ───────────────────
      const prevWinning = await bidRepository.getWinningBid(newBid.productId);

      const batch = db.batch();

      // ── Mark the new bid as winning ──────────────────────────────────────
      // Mark the new bid as winning
      bidRepository.markWinning(batch, snap.ref);

      let outbidUserId: string | null = null;

      if (prevWinning && prevWinning.data.userId !== newBid.userId) {
        outbidUserId = prevWinning.data.userId;

        // Demote previous winner
        bidRepository.markOutbid(batch, prevWinning.ref);

        // Firestore notification for the outbid user
        notificationRepository.createInBatch(batch, {
          userId: outbidUserId,
          type: "bid_outbid",
          priority: "high",
          title: BID_MESSAGES.OUTBID_TITLE,
          message: BID_MESSAGES.OUTBID_MESSAGE(
            newBid.productTitle,
            newBid.currency,
            newBid.bidAmount,
          ),
          relatedId: newBid.productId,
          relatedType: "product",
        });
      }

      // ── Update product counters ──────────────────────────────────────────
      // Update product counters
      productRepository.incrementBidCount(
        batch,
        newBid.productId,
        newBid.bidAmount,
      );

      await batch.commit();

      // ── Realtime DB push for instant UI update (new bid notification) ────
      // Separate from the Firestore batch; failure here is non-fatal.
      try {
        if (outbidUserId) {
          await getRtdb()
            .ref(`notifications/${outbidUserId}`)
            .push({
              type: "bid_outbid",
              title: BID_MESSAGES.OUTBID_TITLE,
              message: BID_MESSAGES.OUTBID_MESSAGE(
                newBid.productTitle,
                newBid.currency,
                newBid.bidAmount,
              ),
              timestamp: Date.now(),
              read: false,
            });
        }
        // Note: /auction-bids/{productId} is written by the API route (bids/route.ts)
        // with the correct schema using .set(). No push needed here.
      } catch (rtdbError) {
        logError(TRIGGER, "Realtime DB push failed (non-fatal)", rtdbError);
      }

      logInfo(TRIGGER, `Bid placed on ${newBid.productId}`, {
        bidId: snap.id,
        amount: newBid.bidAmount,
        outbidUserId,
      });
    } catch (error) {
      logError(TRIGGER, "Error handling bid placement", error, {
        bidId: snap.id,
        productId: newBid.productId,
      });
      throw error;
    }
  },
);
