import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  analyticsAlertsRepository,
  createRouteHandler,
  errorResponse,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user, params }) => {
      const id = (params as { id: string }).id;
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await analyticsAlertsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Alert not found");
      if (doc.ownerId !== user!.uid) return ApiErrors.forbidden("Not your alert");
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        await analyticsAlertsRepository.update(id, body);
        return successResponse({ id }, "Alert updated");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const doc = await analyticsAlertsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Alert not found");
      if (doc.ownerId !== user!.uid) return ApiErrors.forbidden("Not your alert");
      await analyticsAlertsRepository.delete(id);
      return successResponse({ id }, "Alert deleted");
    },
  }),
);
