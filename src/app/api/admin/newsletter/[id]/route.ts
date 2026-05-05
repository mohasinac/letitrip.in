import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  newsletterRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const subscriber = await newsletterRepository.findById(id);
      if (!subscriber) return errorResponse("Subscriber not found", 404);
      return successResponse(subscriber);
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const subscriber = await newsletterRepository.findById(id);
      if (!subscriber) return errorResponse("Subscriber not found", 404);
      await newsletterRepository.unsubscribe(id);
      return successResponse(null, "Subscriber unsubscribed");
    },
  }),
);
