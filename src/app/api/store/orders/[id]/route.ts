import { z } from "zod";
import { withProviders } from "@/providers.config";
import { isSellerUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { assertEmiShippable } from "@mohasinac/appkit/features/seller/actions/seller-actions";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { reconcileOrderShipping } from "@mohasinac/appkit/server";
import { normalizeError } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { orderRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

const ERR_ORDER_NOT_FOUND = "Order not found";

const SELLER_ALLOWED_STATUSES = new Set(["processing", "shipped"]);

const patchOrderSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().optional(),
  shippingCarrier: z.string().optional(),
  /**
   * What the parcel actually cost the seller to post, in decimal rupees.
   *
   * 🛑 Optional. Supplying it is what opts the order into shipping
   * reconciliation — the buyer is credited the difference in points when the
   * seller spent less than was charged, and the seller absorbs the overage
   * when they spent more. Omitting it means "not reconciled", never "free".
   */
  actualShippingCost: z.number().nonnegative().max(100000).optional(),
  /** The courier actually used, if it differs from the one the buyer picked. */
  actualCourierName: z.string().max(120).optional(),
  trackingUrl: z.string().optional(),
  cancellationReason: z.string().optional(),
  markPicked: z.boolean().optional(),
  markPacked: z.boolean().optional(),
  markCodCollected: z.boolean().optional(),
  codCollectionNote: z.string().optional(),
  assignedWorkerId: z.string().optional(),
});

/**
 * Loads the order and enforces store scope in one step. Sellers may only
 * touch their own store's orders; admin/employee see all. A missing order
 * OR a scope mismatch both return 404 (not 403) to avoid leaking order
 * existence to a seller probing another store's IDs.
 */
async function loadScopedOrder(
  user: { uid: string; role?: string },
  id: string,
): Promise<Awaited<ReturnType<typeof orderRepository.findById>> | null> {
  const order = await orderRepository.findById(id);
  if (!order) return null;
  if (!isSellerUser(user)) return order;
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store || order.storeId !== store.id) return null;
  return order;
}

/*
 * What a seller may see of a buyer's order.
 *
 * 🛑 ALLOW-LIST, and it must stay one. This route used to `successResponse(order)`
 * with the raw repository document, which handed the owning seller
 * `userEmailIndex` / `userNameIndex` (HMAC blind indices that exist only for
 * server-side lookup) and `userEmail` — which `mapDoc` DECRYPTS on read, so it
 * arrived as plaintext PII. Root Cause #70 on the orders axis.
 *
 * A deny-list is not an acceptable substitute here: it publishes whatever field
 * is added to OrderDocument next, which is exactly how the original leak
 * happened. Add new fields to this list deliberately or they stay private.
 *
 * `shippingAddress` and `userName` ARE public to the seller on purpose — you
 * cannot fulfil an order without them. `userEmail` is not: the platform owns
 * the notification channel, and a decrypted address turns an order into a
 * mailing-list entry. If direct contact is ever required, add a relay rather
 * than widening this.
 */
const SELLER_ORDER_FIELDS = [
  "id", "status", "paymentStatus", "paymentMethod", "orderDate",
  "createdAt", "updatedAt", "currency", "items", "productId", "productTitle",
  "quantity", "unitPrice", "totalPrice", "shippingFee", "platformFee",
  "codHandlingFee", "codRemainingAmount", "depositAmount", "outOfStockPolicy",
  "orderType", "sourceContext", "imageUrls", "storeId", "storeName",
  "shippingAddress", "userName", "trackingNumber", "carrier", "trackingUrl",
  "statusHistory", "appliedDiscounts", "storeAddons", "gstAmount", "refunds",
  "cancellationReason", "paymentProofUrl", "paymentTransactionId",
  "paymentReviewOutcome", "paymentDeadline",
] as const;

/* `Object.entries` takes a bare `object`, so the INPUT needs no cast. The
   output is typed `JsonValue` rather than `unknown` because this is a response
   body — `audit-unknown-leakage` is right to refuse the looser type. */
function toSellerOrder(order: object): Record<string, JsonValue> {
  const allowed = new Set<string>(SELLER_ORDER_FIELDS);
  return Object.fromEntries(
    Object.entries(order).filter(([key, value]) => allowed.has(key) && value !== undefined),
  ) as Record<string, JsonValue>;
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await loadScopedOrder(user!, id);
      if (!order) return errorResponse(ERR_ORDER_NOT_FOUND, 404);
      return successResponse(toSellerOrder(order));
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof patchOrderSchema>>({
    auth: true,
    roles: ROLES,
    schema: patchOrderSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const order = await loadScopedOrder(user!, id);
      if (!order) return errorResponse(ERR_ORDER_NOT_FOUND, 404);

      const data = body!;
      const isSeller = isSellerUser(user);

      if (data.markPicked) {
        await orderRepository.markPicked(id);
        return successResponse({ id, markedPicked: true });
      }
      if (data.markPacked) {
        await orderRepository.markPacked(id);
        return successResponse({ id, markedPacked: true });
      }
      if (data.markCodCollected) {
        if (order.paymentMethod !== "cod") {
          return errorResponse("Only COD orders can be marked as collected", 400);
        }
        const updated = await orderRepository.markCodCollected(id, user!.uid, data.codCollectionNote);
        return successResponse({ id, paymentRecord: updated.paymentRecord });
      }
      if (data.assignedWorkerId) {
        await orderRepository.assignWorker(id, data.assignedWorkerId);
        return successResponse({ id, assignedWorkerId: data.assignedWorkerId });
      }

      if (!data.status) return errorResponse("status is required", 400);

      if (isSeller && !SELLER_ALLOWED_STATUSES.has(data.status)) {
        return errorResponse("Sellers may only set status to processing or shipped", 403);
      }

      if (data.status === "cancelled") {
        await orderRepository.cancelOrder(id, data.cancellationReason ?? "Cancelled by seller");
        return successResponse({ id, status: "cancelled" });
      }

      /*
       * `JsonValue | Date` — `updateStatus` takes `Partial<OrderDocument>`,
       * whose date fields are `Date`, so narrowing this bag to `JsonValue`
       * was what forced `shippingDate` to be stringified below. Widened
       * rather than cast at the call site, so the next date field added here
       * cannot repeat it.
       */
      const additionalData: Record<string, JsonValue | Date> = {};
      if (data.trackingNumber) additionalData.trackingNumber = data.trackingNumber;
      if (data.shippingCarrier) additionalData.shippingCarrier = data.shippingCarrier;
      if (data.trackingUrl) additionalData.trackingUrl = data.trackingUrl;

      if (data.status === "shipped" && !data.trackingNumber) {
        return errorResponse("trackingNumber is required to mark an order as shipped", 400);
      }
      if (data.status === "shipped") {
        await assertEmiShippable(order);
        // Mirror customShipOrder's side effects (seller-actions.ts) so an
        // order shipped through this direct-status path also becomes
        // payout-eligible — previously only the POST /ship path set these.
        /*
         * 🛑 A `Date`, not `new Date().toISOString()`.
         *
         * `OrderDocument.shippingDate` is declared `Date`, and the sibling
         * writer `customShipOrder` (seller-actions.ts:1042) passes `new
         * Date()` — so this path was storing a STRING in a field the other
         * path stores as a Firestore Timestamp. Two writers, two types, one
         * field.
         *
         * It survived because the only readers were display components
         * (`OrderStatusTimeline` types it `string` and merely renders it), and
         * rendering tolerates both. Date ARITHMETIC does not: `Timestamp`
         * exposes `.toDate()` and a string does not, so the payout-hold and
         * return-window calculations that now measure from this anchor would
         * work on orders shipped via POST /ship and throw — or silently skip —
         * on orders shipped via this PATCH.
         */
        additionalData.shippingDate = new Date();
        additionalData.payoutStatus = "eligible";
      }

      /*
       * 🛑 Reconcile AFTER the status write, and never let it fail the
       * dispatch — same ordering and same reasoning as `customShipOrder`.
       * The parcel has gone; a shipped order awaiting reconciliation is
       * recoverable by re-running, whereas blocking the seller would make
       * them retry the dispatch, which must not happen twice.
       *
       * `reconcileOrderShipping` is idempotent on the order's own
       * `shippingReconciliation` field, so a retry is safe.
       */
      if (data.status === "shipped" && typeof data.actualShippingCost === "number") {
        const courier = data.actualCourierName ?? data.shippingCarrier ?? "unknown";
        try {
          await reconcileOrderShipping(id, {
            courierId: courier,
            courierName: courier,
            actualRate: data.actualShippingCost,
          });
        } catch (err) {
          const e = normalizeError(err);
          /*
           * Best-effort: a failed reconciliation must not block the status
           * update the seller asked for, which is the write they are waiting
           * on.
           *
           * 🛑 But it is LOGGED rather than just normalised. Reconciliation is
           * what credits the shipping saving to the buyer's points, so a
           * silent failure here is money that never arrives — and
           * `void normalizeError(err)` alone types the error without
           * reporting it, which is as silent as `catch {}` while looking
           * handled (audit-silent-degrade's NORMALIZE_THEATRE).
           */
          serverLogger.warn("order shipping reconciliation failed (non-fatal)", {
            orderId: id,
            courier,
            error: e.message,
          });
        }
      }

      await orderRepository.updateStatus(id, data.status, additionalData);
      return successResponse({ id, status: data.status, ...additionalData });
    },
  }),
);
