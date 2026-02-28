/**
 * Job: Cart Prune
 *
 * Runs every Sunday at 04:00 UTC.
 * Deletes cart documents that have not been updated for more than CART_TTL_DAYS.
 * Carts are low-value state that accumulate from anonymous or churned users.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logInfo, logError } from "../utils/logger";
import { batchDelete } from "../utils/batchHelper";
import { SCHEDULES, REGION, CART_TTL_DAYS } from "../config/constants";
import { cartRepository } from "../repositories";

const JOB = "cartPrune";

export const cartPrune = onSchedule(
  {
    schedule: SCHEDULES.WEEKLY_SUN_0400,
    timeZone: "UTC",
    region: REGION,
    timeoutSeconds: 120,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, `Pruning carts idle for > ${CART_TTL_DAYS} days`);

    try {
      const refs = await cartRepository.getStaleRefs();

      if (refs.length === 0) {
        logInfo(JOB, "No stale carts found");
        return;
      }

      const deleted = await batchDelete(refs);
      logInfo(JOB, "Cart prune complete", { deleted });
    } catch (error) {
      logError(JOB, "Fatal error during cart prune", error);
      throw error;
    }
  },
);
