import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  errorResponse,
  shipmentsRepository,
  shipmentLotsRepository,
  createShipmentLotSchema,
  MAX_LOTS_PER_SHIPMENT,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Shipment Lots API — scoped to one shipment (≤10 lots, small enough
 * to always fetch in full, no pagination needed).
 *
 * GET  /api/admin/shipments/[id]/lots
 * POST /api/admin/shipments/[id]/lots
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:read",
    handler: async ({ params }) => {
      const shipmentId = (params as { id: string }).id;
      const lots = await shipmentLotsRepository.listByShipment(shipmentId);
      return successResponse({ lots });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createShipmentLotSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: createShipmentLotSchema,
    handler: async ({ params, body }) => {
      const shipmentId = (params as { id: string }).id;
      const shipment = await shipmentsRepository.findById(shipmentId);
      if (!shipment) return errorResponse("Shipment not found", 404);

      const existing = await shipmentLotsRepository.listByShipment(shipmentId);
      if (existing.length >= MAX_LOTS_PER_SHIPMENT) {
        return errorResponse(`A shipment cannot have more than ${MAX_LOTS_PER_SHIPMENT} lots`, 409);
      }

      const lot = await shipmentLotsRepository.createLot(shipmentId, shipment.status, body!);
      return successResponse(lot, "Lot created");
    },
  }),
);
