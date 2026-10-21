import { withProviders } from "@/providers.config";
/**
 * The receive station's bulk commit — up to 50 rows, one transaction.
 *
 * The station is a scan loop (`BOX-…` arms a box, `LIR-…` increments the item
 * under it) and the operator commits the whole table at the end rather than
 * firing a request per scan. A request per scan would mean a half-received
 * shipment is the normal outcome of a dropped connection.
 *
 * 🛑 THE TRANSACTION IS IN THE REPOSITORY, not here. Two reasons, and the
 * second is the one that caught me: routes in this codebase never touch
 * Firestore directly, and `audit-inventory-ledger-append-only` allows exactly
 * two files to write the ledger — I wrote the transaction inline here first,
 * which would have made this the second writer the audit exists to prevent.
 *
 * 🛑 RECEIVING DOES NOT TOUCH `stockQuantity`. The shipment-link route already
 * does, and doing both double-counts. This records WHERE stock is, never how
 * much exists.
 */
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  successResponse,
  errorResponse,
} from "@mohasinac/appkit/next/api/api-response";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { inventoryPlacementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-placements.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { MAX_RECEIVE_ROWS } from "@mohasinac/appkit/features/inventory/schemas/firestore";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const receiveSchema = z
  .object({
    /** The procurement shipment this stock came from, when there was one. */
    shipmentId: z.string().min(1).optional(),
    rows: z
      .array(
        z
          .object({
            boxId: z.string().min(1),
            productId: z.string().min(1),
            quantity: z.number().int().min(1).max(9999),
            slot: z.string().max(60).optional(),
          })
          .strict(),
      )
      // Shared with the station, so a full table can never be a 400.
      .min(1)
      .max(MAX_RECEIVE_ROWS),
  })
  .strict();

export const POST = withProviders(
  createRouteHandler<(typeof receiveSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:write",
    schema: receiveSchema,
    handler: async ({ body, user }) => {
      const { rows, shipmentId } = body!;

      /*
       * 🛑 EVERY box and product resolved BEFORE the transaction opens, and
       * refused as a unit if any one is missing.
       *
       * A Firestore transaction must finish its reads before its first write,
       * so resolving inside would mean interleaving — but the real reason is
       * the operator: they have already physically filled the boxes, so the
       * useful answer is "all of it, or none of it, and here is exactly which
       * row is wrong", never "rows 1-7 landed".
       */
      const boxIds = [...new Set(rows.map((r) => r.boxId))];
      const productIds = [...new Set(rows.map((r) => r.productId))];

      const [boxes, products] = await Promise.all([
        Promise.all(boxIds.map((id) => storageBoxesRepository.findById(id))),
        Promise.all(productIds.map((id) => productRepository.findById(id))),
      ]);

      const boxById = new Map(boxes.filter(Boolean).map((b) => [b!.id, b!]));
      const productById = new Map(
        products.filter(Boolean).map((p) => [p!.id, p!]),
      );

      for (const id of boxIds) {
        const box = boxById.get(id);
        if (!box) return errorResponse(`Unknown box: ${id}`, 404);
        if (box.status === "retired") {
          // 409, not 400: the request is well-formed and the world changed.
          return errorResponse(
            `${box.code} is retired — reactivate it or pick another box.`,
            409,
          );
        }
      }
      for (const id of productIds) {
        if (!productById.has(id)) {
          return errorResponse(`Unknown product: ${id}`, 404);
        }
      }

      try {
        const result = await inventoryPlacementsRepository.receiveBatch({
          rows: rows.map((r) => {
            const box = boxById.get(r.boxId)!;
            const product = productById.get(r.productId)!;
            return {
              boxId: r.boxId,
              boxCode: box.code,
              productId: r.productId,
              productTitle: product.title ?? r.productId,
              ...(product.sku ? { productSku: product.sku } : {}),
              quantity: r.quantity,
              ...(r.slot ? { slot: r.slot } : {}),
            };
          }),
          actorUid: user!.uid,
          ...(shipmentId ? { shipmentId } : {}),
        });

        return successResponse(
          result,
          `Received ${result.units} unit${result.units === 1 ? "" : "s"} across ${result.rows} row${result.rows === 1 ? "" : "s"}`,
        );
      } catch (err) {
        return errorResponse(normalizeError(err).message, 400);
      }
    },
  }),
);
