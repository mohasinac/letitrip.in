import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { getLotteryEntriesForAdmin, getLotteryEntriesForUser } from "@mohasinac/appkit/server";
import { isAdminUser } from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: admin gets all entries; user gets own only
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const eventId = (params as { id: string }).id;
      const model = { page: 1, pageSize: 20 };

      if (isAdminUser(user!)) {
        const result = await getLotteryEntriesForAdmin("event", eventId, model);
        return successResponse(result, "Lottery entries retrieved");
      }

      // Regular user — own entries only
      const result = await getLotteryEntriesForUser(user!.uid, model);
      const filtered = { ...result, items: result.items.filter((e: { eventId?: string }) => e.eventId === eventId) };
      // Strip other users' PII fields before returning
      const safe = {
        ...filtered,
        items: filtered.items.map((entry) => {
          const { userPhone: _p, userEmail: _e, transactionId: _t, ...rest } = entry;
          return rest;
        }),
      };
      return successResponse(safe, "Your lottery entries");
    },
  }),
);
