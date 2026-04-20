/**
 * Job: Pending Order Timeout
 *
 * Runs every 2 hours.
 * Cancels orders that have been sitting in status=pending + paymentStatus=pending
 * for more than ORDER_TIMEOUT_HOURS. This releases inventory hold and prevents
 * ghost orders from blocking stock.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { notificationRepository } from "@mohasinac/appkit";
import { orderRepository } from "@mohasinac/appkit";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION, ORDER_TIMEOUT_HOURS } from "../config/constants";
import { ORDER_MESSAGES } from "../constants/messages";

const JOB = "pendingOrderTimeout";

export const pendingOrderTimeout = onSchedule(
  {
    schedule: SCHEDULES.EVERY_2_HOURS,
    region: REGION,
    timeoutSeconds: 120,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, `Scanning for orders unpaid > ${ORDER_TIMEOUT_HOURS}h`);

    try {
      const timedOut = await orderRepository.getTimedOutPending(
        ORDER_TIMEOUT_HOURS,
      );

      if (timedOut.length === 0) {
        logInfo(JOB, "No timed-out pending orders found");
        return;
      }

      const batch = db.batch();
      timedOut.forEach(({ ref }) => orderRepository.cancelInBatch(batch, ref));

      // Write cancellation notifications in the same batch
      timedOut.forEach(({ data: order }) => {
        notificationRepository.createInBatch(batch, {
          userId: order.userId,
          type: "order_cancelled",
          priority: "normal",
          title: ORDER_MESSAGES.CANCELLED_TITLE,
          message: ORDER_MESSAGES.CANCELLED_TIMEOUT_MESSAGE(
            order.productTitle,
            ORDER_TIMEOUT_HOURS,
          ),
          relatedId: order.id,
          relatedType: "order",
        });
      });

      await batch.commit();

      logInfo(JOB, "Pending order timeout complete", {
        cancelled: timedOut.length,
      });
    } catch (error) {
      logError(JOB, "Fatal error during pending order timeout", error);
      throw error;
    }
  },
);
