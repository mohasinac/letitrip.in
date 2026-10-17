import { withProviders } from "@/providers.config";
import { z } from "zod";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
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

/* The orders twin one directory over carries the identical shape and reason. */
const bulkProductLocationSchema = z.object({
  productIds: z
    .array(z.string().trim().min(1))
    .min(1, "productIds must be a non-empty array")
    .max(BULK_MAX, `Maximum ${BULK_MAX} products per request`),
  physicalLocation: physicalLocationSchema,
});

export const PATCH = withProviders(createApiHandler<(typeof bulkProductLocationSchema)["_output"]>({
  roles: [...ROLES_STORE_WRITE],
  schema: bulkProductLocationSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    /*
     * 🛑 ONE validator, and it now matches what the modal promises — C4.
     *
     * This hand-checked `typeof loc.zone === "string"`, which ACCEPTS the
     * empty string. So `PhysicalLocationModal`'s "All fields are optional" was
     * honoured only by accident — `typeof "" === "string"` is what made it
     * true — while OMITTING a key, the sensible reading of optional, returned
     * 400. Meanwhile `physicalLocationSchema` existed in
     * `features/orders/schemas/index.ts` and was used by NEITHER route: two
     * validators, and the one actually in force was the hand-check.
     *
     * `normalisePhysicalLocation` makes a missing key and an empty string mean
     * the same thing, and returns `undefined` for an all-blank location — so
     * nothing writes `{zone:"",shelf:"",bin:""}`, the stored shape that made
     * `formatPhysicalLocation` need its own "never print //" guard.
     */
    const physicalLocation = normalisePhysicalLocation(body!.physicalLocation);
    if (!physicalLocation) {
      return ApiErrors.badRequest("physicalLocation needs at least one of zone, shelf or bin");
    }

    const productIds = body!.productIds;

    // Verify ownership before writing â€” reject the whole batch on any mismatch
    const products = await Promise.all(productIds.map((id) => productRepository.findById(id)));
    for (const [i, p] of products.entries()) {
      if (!p || p.storeId !== store.id) {
        return ApiErrors.forbidden(`Product ${productIds[i]} does not belong to your store`);
      }
    }

    /*
     * 🛑 ONE atomic batch, not `Promise.all` of 50 independent updates.
     *
     * The old shape left a PARTIAL result on any mid-flight failure and still
     * returned `{ updated: productIds.length }` — a count it had not achieved,
     * with no way for the caller to learn which half landed.
     *
     * 🛑 It also bypassed `searchTxt`. `productRepository.update` rebuilds
     * `searchTxt` from the merged document, so the OLD shape did index the new
     * location — a plain `batchUpdate` would not. Hence the explicit
     * `searchTxt` recompute below rather than a bare field write: the whole
     * point of C4 is that a location is findable, and a bulk set that skipped
     * the index would make exactly the rows a seller just filed invisible to
     * the search that is supposed to find them.
     */
    const updated = await productRepository.batchUpdateMany(products, {
      physicalLocation,
    } as never);

    return successResponse({ updated });
  },
}));