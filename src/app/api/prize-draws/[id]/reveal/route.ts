import { withProviders } from "@/providers.config";
/**
 * Prize Draw Reveal API (SB4-H, SB8-C)
 *
 * POST /api/prize-draws/[id]/reveal
 *
 * Auth required. The body carries the `orderId` of the prize-draw entry the
 * buyer is revealing. The server runs a Firestore transaction to:
 *   1. Verify order ownership + paid + not already-revealed + within window
 *      + before deadline + `order.prizeDrawProductId === id`.
 *   2. Pull the live product, ensure listingType is "prize-draw".
 *   3. Filter the items array for ones that haven't been won yet.
 *   4. If the pool is exhausted → auto-refund the order and return
 *      `{ refunded: true, reason: "pool_exhausted" }`.
 *   5. Otherwise pick a winner via `crypto.randomInt`, flip the item's
 *      `isWon`, and stamp `order.prizeWon`. The flip is preserved on the
 *      product doc so future reveals can't pick the same slot — but the
 *      public-facing detail page does NOT echo `isWon` to anonymous buyers
 *      (mystery is part of the appeal; see PrizeDrawCollage hideWonState).
 *
 * Idempotent: re-posting after a successful reveal returns the already-won
 * prize without re-rolling.
 */

import { z } from "zod";
import crypto from "node:crypto";
import {
  createRouteHandler,
  successResponse,
  ValidationError,
  NotFoundError,
  ApiError,
  serverLogger,
  getAdminDb,
  PRODUCT_COLLECTION,
  ORDER_COLLECTION,
  OrderStatusValues,
  PaymentStatusValues,
} from "@mohasinac/appkit";
interface PrizeDrawItem {
  itemNumber: number;
  title: string;
  description?: string;
  images: string[];
  video?: { url: string; thumbnailUrl?: string };
  condition: string;
  estimatedValue?: number;
  isWon: boolean;
}
interface ProductDocument {
  id: string;
  title: string;
  storeId: string;
  listingType?: string;
  prizeDrawItems?: PrizeDrawItem[];
  prizeRevealWindowStart?: Date;
  prizeRevealWindowEnd?: Date;
  prizeGithubFileUrl?: string;
}
interface OrderDocument {
  userId: string;
  status: string;
  paymentStatus: string;
  prizeDrawProductId?: string;
  prizeRevealDeadline?: Date;
  prizeWon?: { itemNumber: number; title: string; images: string[]; wonAt: Date };
  notes?: string;
}

const revealSchema = z.object({
  orderId: z.string().min(1),
});

interface RevealSuccessResponse {
  prizeWon: {
    itemNumber: number;
    title: string;
    images: string[];
    estimatedValue?: number;
  };
  alreadyRevealed?: boolean;
  rngSourceUrl?: string;
}

interface RevealPoolExhaustedResponse {
  refunded: true;
  reason: "pool_exhausted";
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(
  createRouteHandler<(typeof revealSchema)["_output"]>({
    auth: true,
    schema: revealSchema,
    handler: async ({ user, body, params }) => {
      const productId = String(
        (params as Record<string, string> | undefined)?.id ?? "",
      );
      if (!productId) throw new ValidationError("productId required");
      const { orderId } = body!;
      const uid = user!.uid;

      const db = getAdminDb();
      const orderRef = db.collection(ORDER_COLLECTION).doc(orderId);
      const productRef = db.collection(PRODUCT_COLLECTION).doc(productId);

      // Pre-tx — quick existence + ownership checks so we fail fast.
      const [orderSnap, productSnap] = await Promise.all([
        orderRef.get(),
        productRef.get(),
      ]);
      if (!orderSnap.exists) throw new NotFoundError("Order not found");
      if (!productSnap.exists) throw new NotFoundError("Prize draw not found");

      const order = orderSnap.data() as OrderDocument;
      const product = productSnap.data() as ProductDocument;

      if (order.userId !== uid) {
        throw new ApiError(403, "You can only reveal your own entries");
      }
      if (product.listingType !== "prize-draw") {
        throw new ValidationError("Listing is not a prize draw");
      }
      if (order.prizeDrawProductId !== productId) {
        throw new ValidationError(
          "Order does not belong to this prize draw",
        );
      }
      if (order.paymentStatus !== PaymentStatusValues.PAID) {
        throw new ValidationError("Order is not paid");
      }
      if (
        order.status === OrderStatusValues.CANCELLED ||
        order.status === OrderStatusValues.REFUNDED
      ) {
        throw new ValidationError("Order is not eligible for reveal");
      }

      // Idempotency — already-revealed orders just return the same prize.
      if (order.prizeWon) {
        const payload: RevealSuccessResponse = {
          prizeWon: {
            itemNumber: order.prizeWon.itemNumber,
            title: order.prizeWon.title,
            images: order.prizeWon.images,
          },
          alreadyRevealed: true,
          rngSourceUrl: product.prizeGithubFileUrl,
        };
        return successResponse(payload);
      }

      const now = new Date();
      const windowStart = product.prizeRevealWindowStart
        ? new Date(product.prizeRevealWindowStart)
        : undefined;
      const windowEnd = product.prizeRevealWindowEnd
        ? new Date(product.prizeRevealWindowEnd)
        : undefined;
      if (!windowStart || !windowEnd) {
        throw new ValidationError("Prize draw reveal window not configured");
      }
      if (now < windowStart) {
        throw new ValidationError(
          "Reveal window has not opened yet for this draw",
        );
      }
      if (now > windowEnd) {
        throw new ValidationError("Reveal window has closed for this draw");
      }
      const deadline = order.prizeRevealDeadline
        ? new Date(order.prizeRevealDeadline)
        : undefined;
      if (deadline && now > deadline) {
        throw new ValidationError(
          "Reveal deadline has passed — this entry has been refunded.",
        );
      }

      // Transaction: lock product+order, re-check pool, pick winner, write.
      const result = await db.runTransaction(async (tx) => {
        const [txProductSnap, txOrderSnap] = await Promise.all([
          tx.get(productRef),
          tx.get(orderRef),
        ]);
        const txProduct = txProductSnap.data() as ProductDocument;
        const txOrder = txOrderSnap.data() as OrderDocument;

        // Re-check idempotency inside the tx.
        if (txOrder.prizeWon) {
          return {
            kind: "already_revealed" as const,
            prizeWon: txOrder.prizeWon,
          };
        }

        const items: PrizeDrawItem[] = Array.isArray(txProduct.prizeDrawItems)
          ? [...txProduct.prizeDrawItems]
          : [];
        const unwonIndices: number[] = items
          .map((it, idx) => (it.isWon ? -1 : idx))
          .filter((idx) => idx >= 0);

        if (unwonIndices.length === 0) {
          // SB8-C — auto-refund on pool exhaustion.
          tx.update(orderRef, {
            status: OrderStatusValues.REFUNDED,
            paymentStatus: PaymentStatusValues.REFUNDED,
            isNonRefundable: false,
            notes: [
              txOrder.notes,
              "Auto-refunded: prize pool exhausted at reveal time.",
            ]
              .filter(Boolean)
              .join(" "),
            updatedAt: new Date(),
          });
          return { kind: "pool_exhausted" as const };
        }

        // crypto.randomInt is rejection-sampled and uniform — safe for fairness.
        const pickPosition = crypto.randomInt(0, unwonIndices.length);
        const pickIndex = unwonIndices[pickPosition];
        const winningItem = items[pickIndex];

        items[pickIndex] = { ...winningItem, isWon: true };

        tx.update(productRef, {
          prizeDrawItems: items,
          updatedAt: new Date(),
        });

        const prizeWon = {
          itemNumber: winningItem.itemNumber,
          title: winningItem.title,
          images: winningItem.images,
          wonAt: new Date(),
        };
        tx.update(orderRef, {
          prizeWon,
          updatedAt: new Date(),
        });

        return { kind: "revealed" as const, prizeWon, item: winningItem };
      });

      if (result.kind === "pool_exhausted") {
        serverLogger.info(
          `Prize reveal pool-exhausted refund: order=${orderId} product=${productId}`,
        );
        const payload: RevealPoolExhaustedResponse = {
          refunded: true,
          reason: "pool_exhausted",
        };
        return successResponse(payload);
      }

      if (result.kind === "already_revealed") {
        const payload: RevealSuccessResponse = {
          prizeWon: {
            itemNumber: result.prizeWon.itemNumber,
            title: result.prizeWon.title,
            images: result.prizeWon.images,
          },
          alreadyRevealed: true,
          rngSourceUrl: product.prizeGithubFileUrl,
        };
        return successResponse(payload);
      }

      serverLogger.info(
        `Prize revealed: order=${orderId} product=${productId} item#${result.prizeWon.itemNumber}`,
      );
      const payload: RevealSuccessResponse = {
        prizeWon: {
          itemNumber: result.prizeWon.itemNumber,
          title: result.prizeWon.title,
          images: result.prizeWon.images,
          estimatedValue: result.item.estimatedValue,
        },
        rngSourceUrl: product.prizeGithubFileUrl,
      };
      return successResponse(payload);
    },
  }),
);
