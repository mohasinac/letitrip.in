import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  shipmentItemsRepository,
  updateShipmentItemSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Single Shipment Item API
 *
 * PATCH  /api/admin/shipments/[id]/lots/[lotId]/items/[itemId]
 * DELETE /api/admin/shipments/[id]/lots/[lotId]/items/[itemId]
 */

export const PATCH = withProviders(
  createRouteHandler<(typeof updateShipmentItemSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: updateShipmentItemSchema,
    handler: async ({ params, body }) => {
      const { itemId } = params as { id: string; lotId: string; itemId: string };
      const item = await shipmentItemsRepository.updateItem(itemId, body!);
      return successResponse(item, "Item updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    handler: async ({ params }) => {
      const { itemId } = params as { id: string; lotId: string; itemId: string };
      await shipmentItemsRepository.delete(itemId);
      return successResponse({ id: itemId }, "Item deleted");
    },
  }),
);
