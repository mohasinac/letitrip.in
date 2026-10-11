import { withProviders } from "@/providers.config";
import { newsletterRepository } from "@mohasinac/appkit/core/newsletter.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const subscriber = await newsletterRepository.findById(id);
      if (!subscriber) return errorResponse("Subscriber not found", 404);
      await newsletterRepository.unsubscribe(id);
      return successResponse(null, "Subscriber unsubscribed");
    },
  }),
);
