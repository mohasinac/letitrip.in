import { withProviders } from "@/providers.config";
import {
  revokeSession,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:sessions:delete",
    handler: async ({ user, params }) => {
      const sessionId = (params as { id: string }).id;
      await revokeSession(sessionId, user!.uid);
      return successResponse(null, "Session revoked");
    },
  }),
);
