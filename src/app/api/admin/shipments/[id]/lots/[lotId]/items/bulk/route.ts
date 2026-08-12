import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  shipmentItemsRepository,
  bulkShipmentItemsSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Shipment Lot Items — Bulk Paste Import
 *
 * POST /api/admin/shipments/[id]/lots/[lotId]/items/bulk
 *
 * Writes the whole import in a single Firestore WriteBatch (≤500 rows,
 * matching Firestore's native batch cap — see MAX_ITEMS_PER_LOT).
 */

export const POST = withProviders(
  createRouteHandler<(typeof bulkShipmentItemsSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: bulkShipmentItemsSchema,
    handler: async ({ params, body }) => {
      const { id: shipmentId, lotId } = params as { id: string; lotId: string };
      const created = await shipmentItemsRepository.bulkCreate(shipmentId, lotId, body!);
      return successResponse({ created }, `${created} item(s) imported`);
    },
  }),
);
