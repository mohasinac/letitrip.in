import { withProviders } from "@/providers.config";
import {
  enterEvent,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createRouteHandler({
    handler: async ({ user, request, params }) => {
      const eventId = (params as { id: string }).id;
      const body = await request.json().catch(() => ({}));
      const result = await enterEvent(eventId, body, user ?? undefined);
      return successResponse(result, "Entry submitted", 201);
    },
  }),
);
