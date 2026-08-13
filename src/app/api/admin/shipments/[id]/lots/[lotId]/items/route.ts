import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  getNumberParam,
  getSearchParams,
  getStringParam,
  shipmentItemsRepository,
  createShipmentItemSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Shipment Lot Items API — paginated (a lot can hold up to 500
 * individually-tracked "main" items).
 *
 * GET  /api/admin/shipments/[id]/lots/[lotId]/items
 * POST /api/admin/shipments/[id]/lots/[lotId]/items — single item
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:read",
    handler: async ({ params, request }) => {
      const { lotId } = params as { id: string; lotId: string };
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });
      const sorts = getStringParam(searchParams, "sorts");

      const result = await shipmentItemsRepository.listByLot(lotId, {
        page: String(page),
        pageSize: String(pageSize),
        sorts,
      });

      return successResponse({
        items: result.items,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages, hasMore: result.hasMore },
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createShipmentItemSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: createShipmentItemSchema,
    handler: async ({ params, body }) => {
      const { id: shipmentId, lotId } = params as { id: string; lotId: string };
      const item = await shipmentItemsRepository.createItem(shipmentId, lotId, body!);
      return successResponse(item, "Item created");
    },
  }),
);
