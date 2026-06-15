import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  moderationQueueRepository,
  parseJsonBody,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
// audit-route-schema-ok: pending-bespoke-schema
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

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
// audit-route-schema-ok: pending-bespoke-schema
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request, params, user }) => {
      const id = (params as { id: string }).id;
      const doc = await moderationQueueRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = await parseJsonBody<Record<string, unknown>>(request);
      try {
        const updated = await moderationQueueRepository.update(id, {
          ...body,
          reviewerId: user!.uid,
          reviewedAt: new Date(),
        });
        return successResponse(updated, "Reviewed");
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);
