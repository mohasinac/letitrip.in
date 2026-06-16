import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  itemRequestsRepository,
  parseJsonBody,
  type FirestoreDocument,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
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
