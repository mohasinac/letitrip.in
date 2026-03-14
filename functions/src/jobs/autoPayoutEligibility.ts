/**
 * Job: Daily Auto-Payout Eligibility Sweep
 *
 * Runs daily at 04:45 UTC — 15 min before the payoutBatch dispatcher
 * (DAILY_0600 - 1:15h buffer) so freshly created "pending" records are
 * picked up in the same morning window.
 *
 * Logic:
 *   1. Find all orders: status='delivered', payoutStatus='eligible',
 *      updatedAt <= (now - AUTO_PAYOUT_WINDOW_DAYS days)
 *   2. Group by sellerId
 *   3. For each seller:
 *        - Load seller document (for payout details)
 *        - Compute net: gross − platformFee(5%) − gatewayFee(2.36%)
 *                       − gstOnPlatformFee(18%)
 *        - Create PayoutDocument (status='pending', isAutomatic=true)
 *        - Batch-update included orders: payoutStatus='requested'
 *   4. Log summary
 *
 * Idempotent: orders at payoutStatus='requested'|'paid' are never returned
 * by getEligibleAutomatic(), so re-runs are safe.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../config/firebase-admin";
import { logInfo, logWarn, logError } from "../utils/logger";
import { SCHEDULES, REGION, BATCH_LIMIT } from "../config/constants";
import {
  orderRepository,
  payoutRepository,
  userRepository,
} from "../repositories";

const JOB = "autoPayoutEligibility";

// Business-rule defaults — matches site-settings schema defaults
const AUTO_PAYOUT_WINDOW_DAYS = 7;
const PLATFORM_COMMISSION_RATE = 0.05; // 5%
const GATEWAY_FEE_RATE = 0.0236; // 2.36% Razorpay
const GST_RATE = 0.18; // 18% GST on platform fee

export const autoPayoutEligibility = onSchedule(
  {
    // Runs at 10:00 AM IST (04:30 UTC) — the platform's business-day start.
    // Using DAILY_0430_UTC ensures the business-day cutoff in
    // getEligibleAutomatic() snaps cleanly to today's 10 AM IST boundary,
    // so "7 business days" counts are always consistent.
    schedule: SCHEDULES.DAILY_0430_UTC,
    timeZone: "Asia/Kolkata",
    region: REGION,
    timeoutSeconds: 540,
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting daily auto-payout eligibility sweep", {
      windowDays: AUTO_PAYOUT_WINDOW_DAYS,
    });

    try {
      const eligible = await orderRepository.getEligibleAutomatic(
        AUTO_PAYOUT_WINDOW_DAYS,
      );

      if (eligible.length === 0) {
        logInfo(JOB, "No auto-payout eligible orders found");
        return;
      }

      logInfo(
        JOB,
        `Found ${eligible.length} eligible order(s) — grouping by seller`,
      );

      // Group by sellerId
      const bySeller = new Map<string, typeof eligible>();
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
          logWarn(
            JOB,
            `Seller ${sellerId} not found — skipping ${orders.length} order(s)`,
            { orderIds: orders.map((o) => o.id) },
          );
          continue;
        }

        const grossAmount = orders.reduce(
          (sum, o) =>
            sum + ((o.data as { totalPrice?: number }).totalPrice ?? 0),
          0,
        );

        const platformFee =
          Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
        const gatewayFee =
          Math.round(grossAmount * GATEWAY_FEE_RATE * 100) / 100;
        const gstAmount = Math.round(platformFee * GST_RATE * 100) / 100;
        const netAmount =
          Math.round(
            (grossAmount - platformFee - gatewayFee - gstAmount) * 100,
          ) / 100;

        const payoutInput = {
          sellerId,
          sellerName: (seller.displayName ??
            seller.email ??
            sellerId) as string,
          sellerEmail: (seller.email ?? "") as string,
          orderIds: orders.map((o) => o.id),
          amount: netAmount,
          grossAmount,
          platformFee,
          platformFeeRate: PLATFORM_COMMISSION_RATE,
          gatewayFee,
          gatewayFeeRate: GATEWAY_FEE_RATE,
          gstAmount,
          gstRate: GST_RATE,
          isAutomatic: true,
          currency: "INR",
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
          notes: `Auto-payout — ${orders.length} delivered order(s) past ${AUTO_PAYOUT_WINDOW_DAYS}-day window`,
          requestedAt: new Date(),
        };

        const { id: payoutId } = await payoutRepository.create(payoutInput);

        // Batch-update included orders (respect BATCH_LIMIT)
        for (let i = 0; i < orders.length; i += BATCH_LIMIT) {
          const slice = orders.slice(i, i + BATCH_LIMIT);
          const batch = db.batch();
          for (const entry of slice) {
            orderRepository.markPayoutRequested(batch, entry.ref, payoutId);
          }
          await batch.commit();
        }

        logInfo(JOB, `Auto-payout created for seller ${sellerId}`, {
          payoutId,
          orderCount: orders.length,
          grossAmount,
          platformFee,
          gatewayFee,
          gstAmount,
          netAmount,
        });

        payoutsCreated++;
        ordersProcessed += orders.length;
      }

      logInfo(JOB, "Daily auto-payout eligibility sweep complete", {
        payoutsCreated,
        ordersProcessed,
      });
    } catch (error) {
      logError(
        JOB,
        "Fatal error during daily auto-payout eligibility sweep",
        error,
      );
      throw error;
    }
  },
);
