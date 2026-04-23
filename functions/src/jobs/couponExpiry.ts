/**
 * Job: Coupon Expiry
 *
 * Runs daily at 00:05 UTC.
 * Deactivates any coupon whose `validity.endDate` is in the past but whose
 * `validity.isActive` is still true. This prevents expired coupon codes from
 * being accepted at checkout even if the API validation is bypassed.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { couponsRepository as couponRepository } from "../lib/appkit";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";

const JOB = "couponExpiry";

export const couponExpiry = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0005,
    timeZone: "UTC",
    region: REGION,
    timeoutSeconds: 120,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting coupon expiry sweep");
    const now = new Date();

    try {
      const refs = await couponRepository.getExpiredActiveRefs(now);

      if (refs.length === 0) {
        logInfo(JOB, "No expired active coupons found");
        return;
      }

      const batch = db.batch();
      refs.forEach((ref) => couponRepository.deactivateInBatch(batch, ref));
      await batch.commit();

      logInfo(JOB, "Coupon expiry complete", { deactivated: refs.length });
    } catch (error) {
      logError(JOB, "Fatal error during coupon expiry", error);
      throw error;
    }
  },
);
