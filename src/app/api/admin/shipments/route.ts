import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  getNumberParam,
  getSearchParams,
  getStringParam,
  shipmentsRepository,
  createShipmentSchema,
  sortBy,
  COMMON_FIELDS,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Admin Procurement Shipments API
 *
 * GET  /api/admin/shipments â€” paginated list
 * POST /api/admin/shipments â€” create (409 on duplicate shipmentNumber)
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 20, { min: 1, max: 50 });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || sortBy(COMMON_FIELDS.CREATED_AT);

      const result = await shipmentsRepository.list({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        shipments: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createShipmentSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:write",
    schema: createShipmentSchema,
    handler: async ({ user, body }) => {
      const shipment = await shipmentsRepository.create({
        ...body!,
        etaDate: body!.etaDate ? new Date(body!.etaDate) : undefined,
        receivedDate: body!.receivedDate ? new Date(body!.receivedDate) : undefined,
        createdBy: user!.uid,
      });
      return successResponse(shipment, "Shipment created");
    },
  }),
);
