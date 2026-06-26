import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  adminNotificationsRepository,
  createRouteHandler,
  parseJsonBody,
  type JsonValue,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:notifications:write",
    handler: async ({ request, params }) => {
      const id = (params as { id: string }).id;
      const doc = await adminNotificationsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      const updated = await adminNotificationsRepository.update(id, body);
      return successResponse(updated);
    },
  }),
);
