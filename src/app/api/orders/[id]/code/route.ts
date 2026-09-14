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
      const contentKind = raw.contentKind ?? "code";
      /*
       * 🛑 `assetPath` IS NEVER RETURNED. It is a raw Firebase Storage path, and
       * a caller who knows one has nothing useful — every read goes through the
       * Admin SDK — but publishing it would leak the private layout and invite
       * exactly the "just fetch it directly" shortcut this design exists to
       * prevent. `downloadUrl` points at the authenticated sibling route
       * instead, which re-checks ownership on every hit.
       *
       * `contentKind` defaults to "code" so a document written before digital
       * content existed answers exactly as it always did.
       */
      /*
       * The seller's redemption instructions ride along on the reveal.
       *
       * `CodeRevealPanel` has always had a `redemptionInstructions` prop and
       * NEITHER of its two mount sites has ever passed it — the branch that
       * renders it was dead code. It could not easily be threaded either: the
       * text lives on the PRODUCT's `digitalCode` block, while both pages build
       * their rows from the ORDER. Returning it here costs one document read,
       * paid only when a buyer actually clicks Reveal.
       */
      const productSnap = await db.collection(PRODUCT_COLLECTION).doc(productId).get();
      const redemptionInstructions = (
        productSnap.data() as { digitalCode?: { redemptionInstructions?: string } } | undefined
      )?.digitalCode?.redemptionInstructions;

      return successResponse({
        contentKind,
        redemptionInstructions,
        code: contentKind === "code" ? raw.code : undefined,
        downloadUrl:
          contentKind === "code" ? undefined : `/api/orders/${orderId}/code/asset`,
        fileName: raw.fileName,
        contentType: raw.contentType,
        orderId: raw.orderId,
        claimedAt: raw.claimedAt,
        expiresAt: raw.expiresAt,
      });
    },
  }),
);