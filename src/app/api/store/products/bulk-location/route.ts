import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse, ApiErrors, productRepository, storeRepository, type JsonValue } from "@mohasinac/appkit";
import { normalisePhysicalLocation } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const BULK_MAX = 50;

export const PATCH = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const body = await request.json() as {
      productIds?: JsonValue;
      physicalLocation?: JsonValue;
    };

    if (!Array.isArray(body.productIds) || body.productIds.length === 0) {
      return ApiErrors.badRequest("productIds must be a non-empty array");
    }
    if (body.productIds.length > BULK_MAX) {
      return ApiErrors.badRequest(`Maximum ${BULK_MAX} products per request`);
    }
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
    const physicalLocation = normalisePhysicalLocation(
      body.physicalLocation as { zone?: string; shelf?: string; bin?: string } | undefined,
    );
    if (!physicalLocation) {
      return ApiErrors.badRequest("physicalLocation needs at least one of zone, shelf or bin");
    }

    const productIds = body.productIds as string[];

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