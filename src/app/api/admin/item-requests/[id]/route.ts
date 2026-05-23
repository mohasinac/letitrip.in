import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  ApiErrors,
  itemRequestsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request, params, user }) => {
      const id = (params as { id: string }).id;
      const doc = await itemRequestsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const patch = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      if (patch.status === "open" && !doc.approvedAt) {
        patch.approvedAt = new Date();
        patch.approvedBy = user!.uid;
      }
      try {
        const updated = await itemRequestsRepository.update(id, patch);
        return successResponse(updated, "Updated");
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);
