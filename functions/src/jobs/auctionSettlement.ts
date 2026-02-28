/**
 * Job: Auction Settlement
 *
 * Runs every 15 minutes.
 * Finds all auction products whose `auctionEndDate` has passed and whose
 * status is still "published", then:
 *   1. Finds the highest `active` bid for each → marks it `won`
 *   2. Marks all other `active` bids for that product `lost`
 *   3. Creates an Order document for the winner
 *   4. Updates the product status to "sold" (or "unsold" if no bids)
 *   5. Writes `bid_won` / `bid_lost` notifications via notificationRepository
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";
import {
  productRepository,
  bidRepository,
  orderRepository,
  notificationRepository,
  type AuctionProductRow,
} from "../repositories";
import { AUCTION_MESSAGES } from "../constants/messages";

const JOB = "auctionSettlement";

async function settleAuction(product: AuctionProductRow): Promise<void> {
  const activeBids = await bidRepository.getActiveByProduct(product.id);

  const batch = db.batch();

  if (activeBids.length === 0) {
    productRepository.updateStatus(batch, product.id, "unsold");
    await batch.commit();
    logInfo(JOB, AUCTION_MESSAGES.NO_BIDS_LOG(product.id));
    return;
  }

  const [winnerEntry, ...loserEntries] = activeBids;

  // Mark winner
  bidRepository.markWon(batch, winnerEntry.ref);

  // Mark losers
  loserEntries.forEach(({ ref }) => bidRepository.markLost(batch, ref));

  // Create order for the winner
  const orderRef = orderRepository.createFromAuction(batch, {
    productId: product.id,
    productTitle: product.title,
    userId: winnerEntry.data.userId,
    userName: winnerEntry.data.userName,
    userEmail: winnerEntry.data.userEmail,
    amount: winnerEntry.data.bidAmount,
    currency: winnerEntry.data.currency,
    auctionProductId: product.id,
  });

  // Update product status
  productRepository.updateStatus(batch, product.id, "sold");

  // Winner notification
  notificationRepository.createInBatch(batch, {
    userId: winnerEntry.data.userId,
    type: "bid_won",
    priority: "high",
    title: AUCTION_MESSAGES.WON_TITLE,
    message: AUCTION_MESSAGES.WON_MESSAGE(
      product.title,
      winnerEntry.data.currency,
      winnerEntry.data.bidAmount,
    ),
    relatedId: product.id,
    relatedType: "product",
  });

  // Loser notifications (cap at first 50 to stay under batch ceiling)
  loserEntries.slice(0, 50).forEach(({ data: bid }) => {
    notificationRepository.createInBatch(batch, {
      userId: bid.userId,
      type: "bid_lost",
      priority: "normal",
      title: AUCTION_MESSAGES.LOST_TITLE,
      message: AUCTION_MESSAGES.LOST_MESSAGE(product.title),
      relatedId: product.id,
      relatedType: "product",
    });
  });

  await batch.commit();

  logInfo(JOB, `Settled auction ${product.id}`, {
    winner: winnerEntry.data.userId,
    winningBid: winnerEntry.data.bidAmount,
    losersCount: loserEntries.length,
    orderId: orderRef.id,
  });
}

export const auctionSettlement = onSchedule(
  {
    schedule: SCHEDULES.EVERY_15_MIN,
    region: REGION,
    timeoutSeconds: 300,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting auction settlement sweep");
    const now = new Date();

    try {
      const expired = await productRepository.getExpiredAuctions(now);

      if (expired.length === 0) {
        logInfo(JOB, "No expired auctions found");
        return;
      }

      logInfo(JOB, `Found ${expired.length} expired auction(s) to settle`);
      const results = await Promise.allSettled(
        expired.map(({ data }) => settleAuction(data)),
      );
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        logError(JOB, `${failed.length} auction(s) failed to settle`, failed);
      }
      logInfo(
        JOB,
        `Settlement complete — ${expired.length - failed.length} succeeded, ${failed.length} failed`,
      );
    } catch (error) {
      logError(JOB, "Fatal error during auction settlement", error);
      throw error;
    }
  },
);
