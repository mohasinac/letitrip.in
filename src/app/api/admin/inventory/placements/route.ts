import { withProviders } from "@/providers.config";
/**
 * Placements — GET "where is this product", POST a place / move / pick.
 *
 * 🛑 Every POST here goes through the repository, which does the placement
 * write and the LEDGER APPEND in one transaction. A placement changed without
 * a movement row is stock that teleported: the count is right and nobody can
 * say why.
 */
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  successResponse,
  errorResponse,
} from "@mohasinac/appkit/next/api/api-response";
import { inventoryPlacementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-placements.repository";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

/*
 * One endpoint, three operations, discriminated on `op`.
 *
 * 🛑 A DISCRIMINATED UNION rather than three optional-field shapes, so the
 * compiler enforces that a `move` carries both boxes and a `pick` carries
 * one. The alternative — one object with everything optional — is how a
 * request validates and then fails at the repository's own assert, which is a
 * 400 the schema should have caught.
 */
const placementSchema = z.discriminatedUnion("op", [
  z
    .object({
      op: z.literal("place"),
      boxId: z.string().min(1),
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
      slot: z.string().max(60).optional(),
      /** `receive` when it came from a shipment, `adjust` when it is a found item. */
      kind: z.enum(["receive", "adjust"]),
      reason: z.string().max(300).optional(),
      shipmentId: z.string().optional(),
    })
    .strict(),
  z
    .object({
      op: z.literal("move"),
      fromBoxId: z.string().min(1),
      toBoxId: z.string().min(1),
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
    .strict(),
  z
    .object({
      op: z.literal("pick"),
      boxId: z.string().min(1),
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
      reason: z.string().max(300).optional(),
    })
    .strict(),
]);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const productId = url.searchParams.get("productId")?.trim();
      const boxId = url.searchParams.get("boxId")?.trim();

      /*
       * One of the two is required. Without either this would be an unbounded
       * collection scan, which Rule #6 forbids outright — and "all placements"
       * is not a question anyone asks: the useful ones are "what is in this
       * box" and "where is this product".
       */
      if (!productId && !boxId) {
        return errorResponse(
          "Pass productId or boxId — a full placement list is not a supported read.",
          400,
        );
      }

      const rows = productId
        ? await inventoryPlacementsRepository.listByProduct(productId)
        : await inventoryPlacementsRepository.listByBox(boxId!);
      return successResponse({
        items: rows,
        totalUnits: rows.reduce((n, r) => n + r.quantity, 0),
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof placementSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:inventory:write",
    schema: placementSchema,
    handler: async ({ body, user }) => {
      const op = body!;
      try {
        /*
         * The denormalised display fields are resolved HERE, server-side,
         * rather than accepted from the client.
         *
         * 🛑 A client-supplied `productTitle` is a client-supplied ledger
         * entry: the row that is supposed to be evidence would say whatever
         * the caller typed. Reading the real documents costs two gets and is
         * the difference between a log and a claim.
         */
        const product = await productRepository.findById(op.productId);
        if (!product) return errorResponse("Product not found", 404);
        const title = product.title ?? op.productId;

        if (op.op === "place") {
          const box = await storageBoxesRepository.findById(op.boxId);
          if (!box) return errorResponse("Box not found", 404);
          if (box.status === "retired") {
            return errorResponse(
              `${box.code} is retired — register a new box or reactivate it first.`,
              409,
            );
          }
          await inventoryPlacementsRepository.place({
            boxId: box.id,
            boxCode: box.code,
            productId: op.productId,
            productTitle: title,
            ...(product.sku ? { productSku: product.sku } : {}),
            quantity: op.quantity,
            ...(op.slot ? { slot: op.slot } : {}),
            actorUid: user!.uid,
            kind: op.kind,
            ...(op.reason ? { reason: op.reason } : {}),
            ...(op.shipmentId ? { shipmentId: op.shipmentId } : {}),
          });
          return successResponse(
            null,
            `${op.quantity} × ${title} into ${box.code}`,
          );
        }

        if (op.op === "move") {
          const [from, to] = await Promise.all([
            storageBoxesRepository.findById(op.fromBoxId),
            storageBoxesRepository.findById(op.toBoxId),
          ]);
          if (!from || !to) return errorResponse("Box not found", 404);
          await inventoryPlacementsRepository.move({
            fromBoxId: from.id,
            fromBoxCode: from.code,
            toBoxId: to.id,
            toBoxCode: to.code,
            productId: op.productId,
            productTitle: title,
            ...(product.sku ? { productSku: product.sku } : {}),
            quantity: op.quantity,
            actorUid: user!.uid,
          });
          return successResponse(
            null,
            `${op.quantity} × ${title} moved ${from.code} → ${to.code}`,
          );
        }

        const box = await storageBoxesRepository.findById(op.boxId);
        if (!box) return errorResponse("Box not found", 404);
        await inventoryPlacementsRepository.pick({
          boxId: box.id,
          boxCode: box.code,
          productId: op.productId,
          productTitle: title,
          quantity: op.quantity,
          actorUid: user!.uid,
          ...(op.reason ? { reason: op.reason } : {}),
        });
        return successResponse(
          null,
          `${op.quantity} × ${title} picked from ${box.code}`,
        );
      } catch (err) {
        const e = normalizeError(err);
        /*
         * "holds N, cannot move M" is a 409: the request is well-formed and
         * the world disagrees with it. A 400 would read as "your form is
         * wrong" when the correct next action is to recount the box and record
         * an `adjust`.
         */
        if (e.message.includes("cannot move") || e.message.includes("cannot pick")) {
          return errorResponse(e.message, 409);
        }
        return errorResponse(e.message, 400);
      }
    },
  }),
);
