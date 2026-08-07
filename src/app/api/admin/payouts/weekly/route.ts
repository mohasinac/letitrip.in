import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  PAYOUT_FIELDS,
  ROLES_ADMIN_ONLY,
} from "@/constants";
/**
 * POST /api/admin/payouts/weekly
 *
 * Admin-manual trigger â€” processes weekly payouts for delivered orders.
 * The scheduled version of this logic runs automatically every Saturday
 * at 05:00 UTC via the `weeklyPayoutEligibility` Firebase Function.
 * Use this endpoint for on-demand admin-initiated runs only.
 *
 * Logic:
 *   1. Find all orders where:
 *        status       === 'delivered'
 *        payoutStatus === 'eligible'
 *   2. Group by sellerId
 *   3. For each seller:
 *        - Load seller payout details
 *        - Compute net amount (gross - 5% platform fee)
 *        - Create a PayoutDocument (status='pending')
 *        - Update all included orders: payoutStatus='requested', payoutId=<new>
 *   4. Return a summary object
 *
 * This endpoint is intentionally idempotent â€” orders with payoutStatus
 * already set to 'requested' or 'paid' are silently skipped.
 */

import {
  userRepository,
  orderRepository,
  payoutRepository,
  storeRepository,
  siteSettingsRepository,
  sortBy,
  COMMON_FIELDS,
  computePayoutDeduction,
} from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";

import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import type { OrderDocument } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";

// --- Route --------------------------------------------------------------------

const __POST__g = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:payouts:write",
  handler: async () => {
    const siteSettings = await siteSettingsRepository.getSingleton();
    const commissions = siteSettings.commissions;
    const eligibleOrders = await orderRepository.listAll({
      filters:
        "payoutStatus==eligible,status==delivered",
      sorts: sortBy(COMMON_FIELDS.CREATED_AT),
      page: "1",
      pageSize: "5000",
    });
    const eligibleDelivered = eligibleOrders.items as (OrderDocument & {
      id: string;
    })[];

    if (eligibleDelivered.length === 0) {
      return successResponse({
        payoutsCreated: 0,
        ordersProcessed: 0,
        sellers: [],
        message: "No eligible orders to process.",
      });
    }

    // -- 2. Group by storeId -----------------------------------------------
    const byStore = eligibleDelivered.reduce<
      Map<string, typeof eligibleDelivered>
    >((map, order) => {
      const id = order.storeId ?? "";
      if (!id) return map;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(order);
      return map;
    }, new Map());

    const payoutSummaries: {
      sellerId: string;
      storeId: string;
      payoutId: string;
      orderCount: number;
      netAmount: number;
      grossAmount: number;
      platformFee: number;
    }[] = [];

    // -- 3. Create one payout per store/seller -----------------------------
    for (const [storeId, orders] of byStore.entries()) {
      const store = await storeRepository.findById(storeId);
      if (!store) {
        serverLogger.warn("Weekly payout: store not found, skipping", {
          storeId,
          orderIds: orders.map((o) => o.id),
        });
        continue;
      }
      const sellerId = store.ownerId;
      const seller = await userRepository.findById(sellerId);
      if (!seller) {
        serverLogger.warn("Weekly payout: seller not found, skipping", {
          sellerId,
          orderIds: orders.map((o) => o.id),
        });
        continue;
      }

      const grossAmount = orders.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
      const { platformFee, gatewayFee, gstOnFee, netAmount } = computePayoutDeduction(grossAmount, commissions);

      const payoutData = {
        storeId,
        sellerName: (seller.displayName ?? seller.email ?? storeId) as string,
        sellerEmail: (seller.email ?? "") as string,
        orderIds: orders.map((o) => o.id!),
        amount: netAmount,
        grossAmount,
        platformFee,
        platformFeeRate: commissions.platformFeePercent / 100,
        gatewayFee,
        gatewayFeeRate: (commissions.gatewayFeePercent ?? 0) / 100,
        gstAmount: gstOnFee,
        gstRate: commissions.gstPercent / 100,
        currency: "INR",
        status: PAYOUT_FIELDS.STATUS_VALUES.PENDING,
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
        notes: `Automated weekly payout â€” ${orders.length} delivered order(s)`,
        requestedAt: new Date(),
      };

      const payoutDoc = await payoutRepository.create(payoutData);
      const payoutId = payoutDoc.id!;

      // Update all included orders
      await Promise.all(
        orders.map((o) =>
          orderRepository.update(o.id!, {
            payoutStatus: "requested",
            payoutId,
          }),
        ),
      );

      payoutSummaries.push({
        sellerId,
        storeId,
        payoutId,
        orderCount: orders.length,
        netAmount,
        grossAmount,
        platformFee,
      });

      serverLogger.info("Weekly payout created", {
        storeId,
        sellerId,
        payoutId,
        orderCount: orders.length,
        netAmount,
      });
    }

    serverLogger.info("Weekly payout batch complete", {
      payoutsCreated: payoutSummaries.length,
      ordersProcessed: eligibleDelivered.length,
    });

    return successResponse(
      {
        payoutsCreated: payoutSummaries.length,
        ordersProcessed: eligibleDelivered.length,
        sellers: payoutSummaries,
      },
      SUCCESS_MESSAGES.PAYOUT.WEEKLY_PROCESSED,
    );
  },
}));

export const POST = withFeatureGuard("PAYOUTS", __POST__g);
