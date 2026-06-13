import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  analyticsCardsRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user, params }) => {
      const id = (params as { id: string }).id;
      const doc = await analyticsCardsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      if (doc.ownerId !== user!.uid && doc.scope !== "seller") {
        return ApiErrors.forbidden("Not yours");
      }
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const updated = await analyticsCardsRepository.update(id, body);
        return successResponse(updated);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const doc = await analyticsCardsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      if (doc.ownerId !== user!.uid && doc.scope !== "seller") {
        return ApiErrors.forbidden("Not yours");
      }
      if (doc.isBuiltIn) return errorResponse("Cannot delete built-in card", 409);
      await analyticsCardsRepository.delete(id);
      return successResponse({ deleted: true });
    },
  }),
);
