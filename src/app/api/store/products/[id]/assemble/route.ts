import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createApiHandler,
  successResponse,
  ApiErrors,
  storeRepository,
} from "@mohasinac/appkit";
import {
  assembleFromComponents,
  partOutToComponents,
  MAX_ASSEMBLY_COMPONENTS,
} from "@mohasinac/appkit/server";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * POST /api/store/products/[id]/assemble — D13.
 *
 * Builds complete beys from component listings, or parts one back out. The
 * direction is a field on the body rather than two routes, because the two
 * operations share every input rule, every ownership check and the same
 * planner — two routes would be two places the rules have to agree.
 *
 * ## 🛑 `storeId` comes from the SESSION, never the body
 *
 * The transaction re-checks ownership per document anyway, but accepting a
 * `storeId` from the caller would mean the route itself offered the hole and
 * relied on a downstream check to close it. Same reason `bulk-stock` leaves it
 * out of its schema.
 *
 * ## 🛑 Why this is a route and not a server action
 *
 * It is a stock mutation across up to nine documents and it must be auditable
 * from a log line. `createApiHandler` gives it the role gate, the Zod parse and
 * the error mapping that `wrapAction` does not — and a server action swallows
 * its own failures into an envelope, so `onRequestError` never fires
 * (Root Cause #87).
 *
 * ## 🛑 It returns the BEFORE and AFTER of every component
 *
 * Not a count. A seller reading "3 components consumed" cannot tell whether the
 * numbers they expected actually moved, and this is the single most common
 * shape of silent wrongness in this codebase — a 200 with a plausible figure.
 * `consumed` carries `before`, `after` and `taken` per row so the UI can show
 * the arithmetic rather than assert it.
 */
const componentSchema = z.object({
  slotKey: z.string().trim().min(1).max(40),
  productId: z.string().trim().min(1).max(200),
  /*
   * How many of THIS part one complete bey needs — 1 for a driver, and more
   * than 1 only for a genuinely repeated slot. Not the total being consumed:
   * that is `quantity × units`, computed by the planner so the multiplication
   * lives in one place.
   */
  quantity: z.number().int().min(1).max(99),
});

const assembleSchema = z.object({
  /*
   * 🛑 An explicit enum, not an `isPartOut: boolean`. A boolean default is how
   * a destructive direction gets chosen by omission; naming both makes the
   * caller say which one, and an unrecognised value is a 400 rather than the
   * safer-looking branch.
   */
  direction: z.enum(["assemble", "part-out"]),
  components: z.array(componentSchema).min(1).max(MAX_ASSEMBLY_COMPONENTS),
  /** Copies to build or break down. Absent means one. */
  units: z.number().int().min(1).max(99).optional(),
});

export const POST = withProviders(
  createApiHandler<(typeof assembleSchema)["_output"]>({
    roles: [...ROLES_STORE_WRITE],
    schema: assembleSchema,
    handler: async ({ user, body, params }) => {
      const productId = typeof params?.id === "string" ? params.id : "";
      if (!productId) return ApiErrors.badRequest("Missing product id");

      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");

      const { direction, components, units } = body!;

      /*
       * The transaction throws `ValidationError` (400) and `ConflictError`
       * (409), and `createApiHandler`'s mapper already turns both into the
       * right status with a user-safe message. Deliberately NOT caught here:
       * a catch would have to re-derive that mapping, and a 409 that arrives
       * as a 500 tells the seller to retry when the answer is to restock.
       */
      const result =
        direction === "assemble"
          ? await assembleFromComponents({
              storeId: store.id,
              targetProductId: productId,
              components,
              units,
            })
          : await partOutToComponents({
              storeId: store.id,
              sourceProductId: productId,
              components,
              units,
            });

      return successResponse(
        result,
        direction === "assemble"
          ? `Built ${result.unitsBuilt} from ${result.consumed.length} component${result.consumed.length === 1 ? "" : "s"}.`
          : `Parted out ${result.unitsBuilt} into ${result.consumed.length} component${result.consumed.length === 1 ? "" : "s"}.`,
      );
    },
  }),
);
