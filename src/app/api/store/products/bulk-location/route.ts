import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse, ApiErrors, productRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const BULK_MAX = 50;

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PATCH = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const body = await request.json() as {
      productIds?: unknown;
      physicalLocation?: unknown;
    };

    if (!Array.isArray(body.productIds) || body.productIds.length === 0) {
      return ApiErrors.badRequest("productIds must be a non-empty array");
    }
    if (body.productIds.length > BULK_MAX) {
      return ApiErrors.badRequest(`Maximum ${BULK_MAX} products per request`);
    }
    const loc = body.physicalLocation as { zone?: unknown; shelf?: unknown; bin?: unknown } | undefined;
    if (!loc || typeof loc.zone !== "string" || typeof loc.shelf !== "string" || typeof loc.bin !== "string") {
      return ApiErrors.badRequest("physicalLocation must have zone, shelf, and bin strings");
    }
    const physicalLocation = { zone: loc.zone, shelf: loc.shelf, bin: loc.bin };

    const productIds = body.productIds as string[];

    // Verify ownership before writing — reject the whole batch on any mismatch
    const products = await Promise.all(productIds.map((id) => productRepository.findById(id)));
    for (const [i, p] of products.entries()) {
      if (!p || p.storeId !== store.id) {
        return ApiErrors.forbidden(`Product ${productIds[i]} does not belong to your store`);
      }
    }

    await Promise.all(
      productIds.map((id) => productRepository.update(id, { physicalLocation } as never)),
    );

    return successResponse({ updated: productIds.length });
  },
}));
