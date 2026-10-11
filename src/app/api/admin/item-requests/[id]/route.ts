import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { itemRequestsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { FirestoreDocument } from "@mohasinac/appkit/schemas/types";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await itemRequestsRepository.findById(id);
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
      const doc = await itemRequestsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const patch = await parseJsonBody<FirestoreDocument>(request);
      if (patch.status === "open" && !doc.approvedAt) {
        patch.approvedAt = new Date();
        patch.approvedBy = user!.uid;
      }
      try {
        const updated = await itemRequestsRepository.update(id, patch);
        return successResponse(updated, "Updated");
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);
