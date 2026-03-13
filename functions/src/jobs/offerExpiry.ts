/**
 * Job: Offer Expiry
 *
 * Runs daily at 00:15 UTC.
 * Finds all "pending" and "countered" offers whose `expiresAt` has passed,
 * then for each:
 *   1. Releases the buyer's engaged RC (amount = offerAmount)
 *   2. Writes a "release" RC ledger transaction
 *   3. Marks the offer as "expired"
 *   4. Notifies the buyer
 *
 * RC note: engaged RC is always equal to offerAmount.
 *   - When status is "pending":   buyer created the offer → engaged offerAmount
 *   - When status is "countered": seller countered but buyer hasn't accepted
 *     yet → no RC adjustment has happened → still offerAmount engaged
 *   RC adjustments only occur in acceptCounterOfferAction (server action) which
 *   transitions the offer to "accepted" — those offers never expire here.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logInfo, logError, logWarn } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";
import {
  offerRepository,
  rcRepository,
  userRepository,
  notificationRepository,
} from "../repositories";

const JOB = "offerExpiry";

export const offerExpiry = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0015,
    timeZone: "UTC",
    region: REGION,
    timeoutSeconds: 300,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting offer expiry sweep");
    const now = new Date();

    let expiredOffers;
    try {
      expiredOffers = await offerRepository.findExpiredActive(now);
    } catch (err) {
      logError(JOB, "Failed to query expired offers", err);
      throw err;
    }

    if (expiredOffers.length === 0) {
      logInfo(JOB, "No expired offers found");
      return;
    }

    logInfo(JOB, `Found ${expiredOffers.length} expired offer(s) to process`);

    const expiredIds: string[] = [];
    let rcReleased = 0;

    for (const offer of expiredOffers) {
      try {
        // 1. Read buyer RC balance before adjustment
        const buyerDocBefore = await userRepository.findRCBalance(
          offer.buyerUid,
        );
        const balanceBefore = buyerDocBefore?.rcBalance ?? 0;

        // 2. Release engaged RC (always offerAmount — see module-level comment)
        await userRepository.incrementRCBalance(
          offer.buyerUid,
          offer.offerAmount, // credit rcBalance
          -offer.offerAmount, // debit engagedRC
        );

        const buyerDocAfter = await userRepository.findRCBalance(
          offer.buyerUid,
        );
        const balanceAfter = buyerDocAfter?.rcBalance ?? 0;

        // 3. Write ledger transaction
        await rcRepository.create({
          userId: offer.buyerUid,
          type: "release",
          coins: offer.offerAmount,
          balanceBefore,
          balanceAfter,
          productId: offer.productId,
          productTitle: offer.productTitle,
          notes: `Offer expired — RC released for offer ${offer.id}`,
        });

        rcReleased += offer.offerAmount;
        expiredIds.push(offer.id);

        // 4. Notify buyer
        await notificationRepository.create({
          userId: offer.buyerUid,
          type: "offer_expired",
          priority: "normal",
          title: "Offer expired",
          message: `Your offer on "${offer.productTitle}" expired without a response. Your RC has been returned.`,
          relatedId: offer.id,
          relatedType: "offer",
        });
      } catch (err) {
        logWarn(JOB, `Failed to process expiry for offer ${offer.id}`, err);
        // Don't throw — continue processing remaining offers
      }
    }

    // 5. Batch-mark all successfully processed offers as "expired"
    if (expiredIds.length > 0) {
      try {
        await offerRepository.expireMany(expiredIds);
      } catch (err) {
        logError(JOB, "Failed to batch-expire offers", err);
        throw err;
      }
    }

    logInfo(JOB, "Offer expiry complete", {
      processed: expiredIds.length,
      skipped: expiredOffers.length - expiredIds.length,
      rcReleased,
    });
  },
);
