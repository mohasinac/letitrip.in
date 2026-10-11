import { withProviders } from "@/providers.config";
import { revokeSession } from "@mohasinac/appkit/features/admin/actions/admin-actions";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ user, params }) => {
      const sessionId = (params as { id: string }).id;
      await revokeSession(sessionId, user!.uid);
      return successResponse(null, "Session revoked");
    },
  }),
);
