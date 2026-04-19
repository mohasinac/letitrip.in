/**
 * Job: Weekly Payout Eligibility Sweep
 *
 * Runs every Saturday at 05:00 UTC — one hour before the payoutBatch
 * dispatcher (DAILY_0600) so freshly created "pending" records are picked
 * up in the same morning window.
 *
 * Logic:
 *   1. Find all orders: status='delivered', shippingMethod='shiprocket',
 *      payoutStatus='eligible'
 *   2. Group by sellerId
 *   3. For each seller:
 *        - Load seller document (for payout details)
 *        - Compute net amount (gross - 5% platform fee)
 *        - Create a PayoutDocument (status='pending')
 *        - Batch-update all included orders: payoutStatus='requested'
 *   4. Log a summary
 *
 * Idempotent: orders already at payoutStatus='requested' or 'paid' are
 * never returned by getEligibleShiprocket(), so re-runs are safe.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { getDefaultCurrency } from "@mohasinac/appkit/core";
import { userRepository } from "@mohasinac/appkit/features/auth/server";
import { orderRepository } from "@mohasinac/appkit/features/orders/server";
import { payoutRepository } from "@mohasinac/appkit/features/payments/server";
import { db } from "../config/firebase-admin";
import { logInfo, logWarn, logError } from "../utils/logger";
import { SCHEDULES, REGION, BATCH_LIMIT } from "../config/constants";

const JOB = "weeklyPayoutEligibility";
const PLATFORM_COMMISSION_RATE = 0.05; // 5 %

export const weeklyPayoutEligibility = onSchedule(
  {
    schedule: SCHEDULES.WEEKLY_SAT_0500,
    timeZone: "UTC",
    region: REGION,
    timeoutSeconds: 540,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting weekly payout eligibility sweep");

    try {
      const eligible = await orderRepository.getEligibleShiprocket();

      if (eligible.length === 0) {
        logInfo(JOB, "No eligible Shiprocket-delivered orders found");
        return;
      }

      logInfo(JOB, `Found ${eligible.length} eligible order(s) — grouping by seller`);

      // Group by sellerId
      const bySeller = new Map<
        string,
        typeof eligible
      >();
      for (const entry of eligible) {
        const sellerId = (entry.data as { sellerId?: string }).sellerId;
        if (!sellerId) {
          logWarn(JOB, `Order ${entry.id} has no sellerId — skipping`);
          continue;
        }
        if (!bySeller.has(sellerId)) bySeller.set(sellerId, []);
        bySeller.get(sellerId)!.push(entry);
      }

      let payoutsCreated = 0;
      let ordersProcessed = 0;

      for (const [sellerId, orders] of bySeller.entries()) {
        const seller = await userRepository.findById(sellerId);
        if (!seller) {
          logWarn(JOB, `Seller ${sellerId} not found — skipping ${orders.length} order(s)`, {
            orderIds: orders.map((o) => o.id),
          });
          continue;
        }

        const grossAmount = orders.reduce(
          (sum, o) => sum + ((o.data as { totalPrice?: number }).totalPrice ?? 0),
          0,
        );
        const platformFee = Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
        const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

        const payoutInput = {
          sellerId,
          sellerName: (seller.displayName ?? seller.email ?? sellerId) as string,
          sellerEmail: (seller.email ?? "") as string,
          orderIds: orders.map((o) => o.id),
          amount: netAmount,
          grossAmount,
          platformFee,
          platformFeeRate: PLATFORM_COMMISSION_RATE,
          currency: getDefaultCurrency(),
          status: "pending" as const,
          paymentMethod:
            seller.payoutDetails?.method === "upi"
              ? ("upi" as const)
              : ("bank_transfer" as const),
          upiId:
            seller.payoutDetails?.method === "upi"
              ? seller.payoutDetails.upiId
              : undefined,
          bankAccount:
            seller.payoutDetails?.method === "bank_transfer" &&
            seller.payoutDetails.bankAccount
              ? {
                  accountHolderName:
                    seller.payoutDetails.bankAccount.accountHolderName,
                  accountNumberMasked:
                    seller.payoutDetails.bankAccount.accountNumberMasked,
                  ifscCode: seller.payoutDetails.bankAccount.ifscCode,
                  bankName: seller.payoutDetails.bankAccount.bankName,
                }
              : undefined,
          notes: `Automated weekly payout — ${orders.length} Shiprocket delivered order(s)`,
          requestedAt: new Date(),
        };

        const { id: payoutId } = await payoutRepository.create(payoutInput);

        // Batch-update all included orders (respect BATCH_LIMIT)
        for (let i = 0; i < orders.length; i += BATCH_LIMIT) {
          const slice = orders.slice(i, i + BATCH_LIMIT);
          const batch = db.batch();
          for (const entry of slice) {
            orderRepository.markPayoutRequested(batch, entry.ref, payoutId);
          }
          await batch.commit();
        }

        logInfo(JOB, `Payout created for seller ${sellerId}`, {
          payoutId,
          orderCount: orders.length,
          netAmount,
          grossAmount,
          platformFee,
        });

        payoutsCreated++;
        ordersProcessed += orders.length;
      }

      logInfo(JOB, "Weekly payout eligibility sweep complete", {
        payoutsCreated,
        ordersProcessed,
      });
    } catch (error) {
      logError(JOB, "Fatal error during weekly payout eligibility sweep", error);
      throw error;
    }
  },
);
