/**
 * Job: Offer Expiry
 *
 * Runs daily at 00:15 UTC.
 * Finds all "pending" and "countered" offers whose `expiresAt` has passed,
 * then for each:
 *   1. Marks the offer as "expired"
 *   2. Notifies the buyer
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { notificationRepository, offerRepository } from "../lib/appkit";
import { logInfo, logError, logWarn } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";

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

    for (const offer of expiredOffers) {
      try {
        expiredIds.push(offer.id);

        // Notify buyer
        await notificationRepository.create({
          userId: offer.buyerUid,
          type: "offer_expired",
          priority: "normal",
          title: "Offer expired",
          message: `Your offer on "${offer.productTitle}" expired without a response.`,
          relatedId: offer.id,
          relatedType: "offer",
        });
      } catch (err) {
        logWarn(JOB, `Failed to process expiry for offer ${offer.id}`, {
          error: err instanceof Error ? err.message : String(err),
        });
        // Don't throw — continue processing remaining offers
      }
    }

    // Batch-mark all successfully processed offers as "expired"
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
    });
  },
);
