import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { createRouteHandler, errorResponse, parseJsonBody, successResponse } from "@mohasinac/appkit";
import { shipOrderAction } from "@/actions/seller.actions";
import { ROLES_STORE_WRITE } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    permission: "store:api:write",
    handler: async ({ request, params }) => {
      const orderId = (params as { id: string }).id;
      const body = await parseJsonBody<Parameters<typeof shipOrderAction>[1]>(request);

      try {
        const result = await shipOrderAction(orderId, body);
        return successResponse(result, "Order marked as shipped");
      } catch (err: unknown) {
        void normalizeError(err);
        const msg = err instanceof Error ? err.message : "Failed to ship order";
        return errorResponse(msg, 400);
      }
    },
  }),
);
