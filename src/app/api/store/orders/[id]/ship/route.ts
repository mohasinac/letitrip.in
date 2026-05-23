import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, errorResponse } from "@mohasinac/appkit";
import { shipOrderAction } from "@/actions/seller.actions";
import { ROLES_STORE_WRITE } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, params }) => {
      const orderId = (params as { id: string }).id;
      const body = await request.json().catch(() => ({}));

      try {
        const result = await shipOrderAction(orderId, body);
        return successResponse(result, "Order marked as shipped");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to ship order";
        return errorResponse(msg, 400);
      }
    },
  }),
);
