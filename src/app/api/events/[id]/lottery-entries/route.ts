import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  isAdminUser,
  isModeratorUser,
  sortBy,
  successResponse,
} from "@mohasinac/appkit";
import { getLotteryEntriesForAdmin, getLotteryEntriesForUser } from "@mohasinac/appkit/server";

// rbac-scope-enforced-in-handler: admin sees all entries; authed user sees own only
const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request, params }) => {
      const id = (params as { id: string }).id;
      const sp = new URL(request.url).searchParams;
      const model = {
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? sortBy("submittedAt"),
        page: Number(sp.get("page") ?? 1),
        pageSize: Math.min(Number(sp.get("pageSize") ?? 20), 50),
      };

      const isAdmin = isAdminUser(user) || isModeratorUser(user);
      const result = isAdmin
        ? await getLotteryEntriesForAdmin("event", id, model)
        : await getLotteryEntriesForUser(user!.uid, model);

      return successResponse(result);
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const GET = withFeatureGuard("EVENTS", __GET__g);
