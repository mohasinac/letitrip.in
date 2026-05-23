import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  reportsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await reportsRepository.findById(id);
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
      const doc = await reportsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const updated = await reportsRepository.update(id, {
          ...body,
          assignedTo: user!.uid,
        });
        return successResponse(updated, "Updated");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);
