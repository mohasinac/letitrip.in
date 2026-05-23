import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  triggerEventRaffleAction,
} from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:events:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await triggerEventRaffleAction({ eventId: id });
      if (result.reason && !result.raffleWinnerUserId) {
        return errorResponse(result.reason, 409);
      }
      return successResponse(result, "Raffle triggered");
    },
  }),
);
