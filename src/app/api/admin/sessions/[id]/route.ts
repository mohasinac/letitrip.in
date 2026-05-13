import { withProviders } from "@/providers.config";
import {
  revokeSession,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:sessions:delete",
    handler: async ({ user, params }) => {
      const sessionId = (params as { id: string }).id;
      await revokeSession(sessionId, user!.uid);
      return successResponse(null, "Session revoked");
    },
  }),
);
