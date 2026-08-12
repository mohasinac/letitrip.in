import { withProviders } from "@/providers.config";
import {
  revokeSession,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const sessionId = (params as { id: string }).id;
      await revokeSession(sessionId, user!.uid);
      return successResponse(null, "Session revoked");
    },
  }),
);