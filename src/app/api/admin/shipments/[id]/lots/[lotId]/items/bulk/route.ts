import { withProviders } from "@/providers.config";
import { shipmentItemsRepository } from "@mohasinac/appkit/features/shipments/repository/shipment-items.repository";
import { bulkShipmentItemsSchema } from "@mohasinac/appkit/features/shipments/schemas/validation";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
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
