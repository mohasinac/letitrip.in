import { withProviders } from "@/providers.config";
import {
  enterEvent,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createRouteHandler({
    authOptional: true,
    handler: async ({ user, request, params }) => {
      const eventId = (params as { id: string }).id;
      const body = await request.json().catch(() => ({}));
      const safeUser = user
        ? { uid: user.uid, displayName: user.displayName, email: user.email ?? undefined }
        : undefined;
      const result = await enterEvent(eventId, body, safeUser);
      return successResponse(result, "Entry submitted", 201);
    },
  }),
);
