import { withProviders } from "@/providers.config";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";
import { shipOrderAction } from "@/actions/seller.actions";
import { shipOrderSchema } from "@mohasinac/appkit/features/seller/schemas/order-forms";

export const POST = withProviders(
  createRouteHandler<(typeof shipOrderSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    /*
     * The same schema the action safe-parses, so the 400 arrives before the
     * action's auth and rate-limit work rather than after. The action keeps its
     * own check — it is also reachable directly from a server action, where no
     * route validated anything first.
     */
    schema: shipOrderSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const result = await shipOrderAction(id, body!);
      if (!result.ok) return errorResponse(result.error ?? "Failed to ship order", 400);
      return successResponse(result.data);
    },
  }),
);
