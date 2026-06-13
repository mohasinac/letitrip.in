import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse, ApiErrors, orderRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const BULK_MAX = 50;

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PATCH = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const body = await request.json() as {
      orderIds?: unknown;
      physicalLocation?: unknown;
    };

    if (!Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return ApiErrors.badRequest("orderIds must be a non-empty array");
    }
    if (body.orderIds.length > BULK_MAX) {
      return ApiErrors.badRequest(`Maximum ${BULK_MAX} orders per request`);
    }
    const loc = body.physicalLocation as { zone?: unknown; shelf?: unknown; bin?: unknown } | undefined;
    if (!loc || typeof loc.zone !== "string" || typeof loc.shelf !== "string" || typeof loc.bin !== "string") {
      return ApiErrors.badRequest("physicalLocation must have zone, shelf, and bin strings");
    }
    const physicalLocation = { zone: loc.zone, shelf: loc.shelf, bin: loc.bin };

    const orderIds = body.orderIds as string[];

    // Verify ownership — reject batch on any mismatch
    const orders = await Promise.all(orderIds.map((id) => orderRepository.findById(id)));
    for (const [i, o] of orders.entries()) {
      if (!o || o.storeId !== store.id) {
        return ApiErrors.forbidden(`Order ${orderIds[i]} does not belong to your store`);
      }
    }

    await Promise.all(
      orderIds.map((id) => orderRepository.update(id, { physicalLocation } as never)),
    );

    return successResponse({ updated: orderIds.length });
  },
}));
