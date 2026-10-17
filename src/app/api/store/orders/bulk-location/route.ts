import { withProviders } from "@/providers.config";
import { z } from "zod";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository } from "@mohasinac/appkit";
import { normalisePhysicalLocation } from "@mohasinac/appkit/utils/physical-location";
import { ROLES_STORE_WRITE } from "@/constants";

const BULK_MAX = 50;

/*
 * Shared shape with the twin route one directory over. `normalisePhysicalLocation`
 * already rejects an all-empty location, so the schema's job is the part a
 * runtime helper cannot do: prove the three slots are STRINGS. The previous
 * `body.physicalLocation as { zone?: string; … }` cast let `{ zone: 42 }`
 * through, and 42 was written to the document as a shelf label.
 */
const physicalLocationSchema = z.object({
  zone: z.string().trim().max(60).optional(),
  shelf: z.string().trim().max(60).optional(),
  bin: z.string().trim().max(60).optional(),
});

/*
 * `BULK_MAX` lives IN the schema rather than in a hand-written length check
 * after it. Rule #6's bound is the reason the cap exists — 50 ids is 50
 * Firestore reads inside one 10s handler — so an over-long array belongs
 * rejected before any of them run.
 */
const bulkOrderLocationSchema = z.object({
  orderIds: z
    .array(z.string().trim().min(1))
    .min(1, "orderIds must be a non-empty array")
    .max(BULK_MAX, `Maximum ${BULK_MAX} orders per request`),
  physicalLocation: physicalLocationSchema,
});

export const PATCH = withProviders(createApiHandler<(typeof bulkOrderLocationSchema)["_output"]>({
  roles: [...ROLES_STORE_WRITE],
  schema: bulkOrderLocationSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    /*
     * The same one validator as the products route — see its header for why
     * there were two and neither was the one in force.
     */
    const physicalLocation = normalisePhysicalLocation(body!.physicalLocation);
    if (!physicalLocation) {
      return ApiErrors.badRequest("physicalLocation needs at least one of zone, shelf or bin");
    }

    const orderIds = body!.orderIds;

    // Verify ownership â€” reject batch on any mismatch
    const orders = await Promise.all(orderIds.map((id) => orderRepository.findById(id)));
    for (const [i, o] of orders.entries()) {
      if (!o || o.storeId !== store.id) {
        return ApiErrors.forbidden(`Order ${orderIds[i]} does not belong to your store`);
      }
    }
    /*
     * One atomic batch, and it keeps `searchTxt` correct — see
     * `batchUpdateMany`. `buildOrderSearchTxt` now indexes the location too,
     * so a staged parcel is findable by its bin from the orders list exactly
     * as a product is from the products list.
     */
    const updated = await orderRepository.batchUpdateMany(orders, {
      physicalLocation,
    } as never);

    return successResponse({ updated });
  },
}));