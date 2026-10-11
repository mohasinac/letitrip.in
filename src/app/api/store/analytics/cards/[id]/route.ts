import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { analyticsCardsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { ROLES_STORE_WRITE } from "@/constants";

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
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      try {
        const updated = await analyticsCardsRepository.update(id, body);
        return successResponse(updated);
      } catch (err) {
        void normalizeError(err);
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
