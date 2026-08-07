import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, errorResponse, parseJsonBody } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { shipOrderAction } from "@/actions/seller.actions";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, params }) => {
      const id = (params as { id: string }).id;
      const body = await parseJsonBody(request, { allowEmpty: true }).catch(() => ({}));
      const result = await shipOrderAction(id, body as never);
      if (!result.ok) return errorResponse(result.error ?? "Failed to ship order", 400);
      return successResponse(result.data);
    },
  }),
);
