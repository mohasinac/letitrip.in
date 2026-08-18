import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  errorResponse,
  shipmentsRepository,
  updateShipmentSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Single Procurement Shipment API
 *
 * GET    /api/admin/shipments/[id]
 * PATCH  /api/admin/shipments/[id] â€” header fields only. Writing
 *        customsTotal/shippingTotal/laborHoursSpent here is what
 *        re-triggers the Firestore Function allocation cascade.
 * DELETE /api/admin/shipments/[id] â€” 409 if any item is still linked to a
 *        product; the lots/items cascade-delete is handled by the
 *        onShipmentDeleted Firestore trigger, not this route.
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const shipment = await shipmentsRepository.findById(id);
      if (!shipment) return errorResponse("Shipment not found", 404);
      return successResponse(shipment);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateShipmentSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: updateShipmentSchema,
    handler: async ({ params, body }) => {
      const id = (params as { id: string }).id;
      const shipment = await shipmentsRepository.update(id, {
        ...body!,
        etaDate: body!.etaDate ? new Date(body!.etaDate) : undefined,
        receivedDate: body!.receivedDate ? new Date(body!.receivedDate) : undefined,
      });
      return successResponse(shipment, "Shipment updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await shipmentsRepository.delete(id);
      return successResponse({ id }, "Shipment deleted");
    },
  }),
);
