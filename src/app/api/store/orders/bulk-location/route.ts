import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse, ApiErrors, orderRepository, storeRepository, normalisePhysicalLocation, type JsonValue } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const BULK_MAX = 50;

export const PATCH = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const body = await request.json() as {
      orderIds?: JsonValue;
      physicalLocation?: JsonValue;
    };

    if (!Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return ApiErrors.badRequest("orderIds must be a non-empty array");
    }
    if (body.orderIds.length > BULK_MAX) {
      return ApiErrors.badRequest(`Maximum ${BULK_MAX} orders per request`);
    }
    /*
     * The same one validator as the products route — see its header for why
     * there were two and neither was the one in force.
     */
    const physicalLocation = normalisePhysicalLocation(
      body.physicalLocation as { zone?: string; shelf?: string; bin?: string } | undefined,
    );
    if (!physicalLocation) {
      return ApiErrors.badRequest("physicalLocation needs at least one of zone, shelf or bin");
    }

    const orderIds = body.orderIds as string[];

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