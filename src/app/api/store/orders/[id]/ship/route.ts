import { withProviders } from "@/providers.config";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";
import { shipOrderAction } from "@/actions/seller.actions";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    handler: async ({ request, params }) => {
      const id = (params as { id: string }).id;
      const body = await parseJsonBody(request, { allowEmpty: true }).catch(() => ({}));
      const result = await shipOrderAction(id, body as never);
      if (!result.ok) return errorResponse(result.error ?? "Failed to ship order", 400);
      return successResponse(result.data);
    },
  }),
);
