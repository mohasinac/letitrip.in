import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  triggerEventRaffleAction,
} from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

const __POST__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:events:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await triggerEventRaffleAction({ eventId: id });
      if (!result.ok) {
        return errorResponse(result.error, 500);
      }
      const data = result.data;
      if (data.reason && !data.raffleWinnerUserId) {
        return errorResponse(data.reason, 409);
      }
      return successResponse(data, "Raffle triggered");
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const POST = withFeatureGuard("EVENTS", __POST__g);
