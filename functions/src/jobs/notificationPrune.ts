/**
 * Job: Notification Prune
 *
 * Runs every Monday at 01:00 UTC.
 * Deletes read notifications older than NOTIFICATION_TTL_DAYS. This prevents
 * the notifications collection from growing without bound for active users who
 * never manually clear their notification history.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { notificationRepository } from "@mohasinac/appkit/features/admin/server";
import { logInfo, logError } from "../utils/logger";
import { batchDelete } from "../utils/batchHelper";
import { SCHEDULES, REGION, NOTIFICATION_TTL_DAYS } from "../config/constants";

const JOB = "notificationPrune";

export const notificationPrune = onSchedule(
  {
    schedule: SCHEDULES.WEEKLY_MON_0100,
    timeZone: "UTC",
    region: REGION,
    timeoutSeconds: 120,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(
      JOB,
      `Pruning read notifications older than ${NOTIFICATION_TTL_DAYS} days`,
    );

    try {
      const refs = await notificationRepository.getOldReadRefs(
        NOTIFICATION_TTL_DAYS,
      );

      if (refs.length === 0) {
        logInfo(JOB, "No stale read notifications found");
        return;
      }

      const deleted = await batchDelete(refs);
      logInfo(JOB, "Notification prune complete", {
        deleted,
      });
    } catch (error) {
      logError(JOB, "Fatal error during notification prune", error);
      throw error;
    }
  },
);
