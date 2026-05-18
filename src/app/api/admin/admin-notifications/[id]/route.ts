import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  adminNotificationsRepository,
} from "@mohasinac/appkit";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request, params }) => {
      const id = (params as { id: string }).id;
      const doc = await adminNotificationsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const updated = await adminNotificationsRepository.update(id, body);
      return successResponse(updated);
    },
  }),
);
