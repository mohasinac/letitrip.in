/**
 * SB-UNI-N — Reveal the digital code for a confirmed order.
 *
 * GET /api/orders/[id]/code
 *
 * Returns the code only when:
 *  - The order belongs to the authenticated buyer
 *  - The order is in CONFIRMED / PROCESSING / DELIVERED status (payment confirmed)
 *  - The first order item is a digital-code listing
 *  - A code has been atomically claimed against this orderId
 *
 * If auto-claim ran at checkout (codeDeliveryMethod:"auto-claim") the code is
 * already in the subcollection with status:"claimed" and orderId set.
 * This endpoint just fetches and returns it.
 */

import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  orderRepository,
  ORDER_FIELDS,
} from "@mohasinac/appkit";
import { getAdminDb } from "@mohasinac/appkit/server";
import {
  PRODUCT_CODES_SUBCOLLECTION,
  PRODUCT_COLLECTION,
  type ProductCodeDocument,
} from "@mohasinac/appkit";

const ALLOWED_STATUSES = new Set(["confirmed", "processing", "delivered"]);

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params, user }) => {
      const orderId = (params as { id: string }).id;
      const order = await orderRepository.findById(orderId);
      if (!order || order.userId !== user!.uid) {
        return ApiErrors.notFound("Order not found");
      }

      const status = order.status?.toLowerCase() ?? "";
      if (!ALLOWED_STATUSES.has(status)) {
        return ApiErrors.badRequest(
          "Code is only available after payment is confirmed",
        );
      }

      // Use the first item's productId to locate the code subcollection
      const productId = order.items?.[0]?.productId ?? order.productId;
      if (!productId) return ApiErrors.notFound("No product on order");

      const db = getAdminDb();
      const snap = await db
        .collection(PRODUCT_COLLECTION)
        .doc(productId)
        .collection(PRODUCT_CODES_SUBCOLLECTION)
        .where("orderId", "==", orderId)
        .where(ORDER_FIELDS.STATUS, "==", "claimed")
        .limit(1)
        .get();

      if (snap.empty) {
        return ApiErrors.notFound("No code found for this order");
      }

      const raw = snap.docs[0].data() as Omit<ProductCodeDocument, "id">;
      return successResponse({
        code: raw.code,
        orderId: raw.orderId,
        claimedAt: raw.claimedAt,
        expiresAt: raw.expiresAt,
      });
    },
  }),
);
