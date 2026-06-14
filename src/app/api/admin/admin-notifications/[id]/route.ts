import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  adminNotificationsRepository,
  createRouteHandler,
  parseJsonBody,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request, params }) => {
      const id = (params as { id: string }).id;
      const doc = await adminNotificationsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const updated = await adminNotificationsRepository.update(id, body);
      return successResponse(updated);
    },
  }),
);
