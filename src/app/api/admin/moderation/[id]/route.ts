import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  moderationQueueRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await moderationQueueRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request, params, user }) => {
      const id = (params as { id: string }).id;
      const doc = await moderationQueueRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const updated = await moderationQueueRepository.update(id, {
          ...body,
          reviewerId: user!.uid,
          reviewedAt: new Date(),
        });
        return successResponse(updated, "Reviewed");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);
