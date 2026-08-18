import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  errorResponse,
  shipmentLotsRepository,
  shipmentItemsRepository,
  updateShipmentLotSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Single Shipment Lot API
 *
 * GET    /api/admin/shipments/[id]/lots/[lotId]
 * PATCH  /api/admin/shipments/[id]/lots/[lotId] — header + remainder fields;
 *        writing weightGrams/purchaseCost/remainder* re-triggers the
 *        allocation cascade on the parent shipment.
 * DELETE /api/admin/shipments/[id]/lots/[lotId] — 409 if any of its items
 *        is still linked to a product.
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:read",
    handler: async ({ params }) => {
      const { lotId } = params as { id: string; lotId: string };
      const lot = await shipmentLotsRepository.findById(lotId);
      if (!lot) return errorResponse("Lot not found", 404);
      return successResponse(lot);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateShipmentLotSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: updateShipmentLotSchema,
    handler: async ({ params, body }) => {
      const { lotId } = params as { id: string; lotId: string };
      const lot = await shipmentLotsRepository.updateLot(lotId, body!);
      return successResponse(lot, "Lot updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    handler: async ({ params }) => {
      const { lotId } = params as { id: string; lotId: string };
      const linked = await shipmentItemsRepository.hasLinkedItemsInLot(lotId);
      if (linked) {
        return errorResponse("Cannot delete a lot with items still linked to a product. Unlink first.", 409);
      }
      await shipmentLotsRepository.delete(lotId);
      return successResponse({ id: lotId }, "Lot deleted");
    },
  }),
);
