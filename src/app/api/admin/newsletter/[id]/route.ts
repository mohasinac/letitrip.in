import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  newsletterRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:newsletter:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const subscriber = await newsletterRepository.findById(id);
      if (!subscriber) return errorResponse("Subscriber not found", 404);
      return successResponse(subscriber);
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:newsletter:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const subscriber = await newsletterRepository.findById(id);
      if (!subscriber) return errorResponse("Subscriber not found", 404);
      await newsletterRepository.unsubscribe(id);
      return successResponse(null, "Subscriber unsubscribed");
    },
  }),
);
