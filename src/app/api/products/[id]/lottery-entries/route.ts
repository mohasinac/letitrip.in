import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  sortBy,
  successResponse,
} from "@mohasinac/appkit";
import { getLotteryEntriesForAdmin, getLotteryEntriesForUser } from "@mohasinac/appkit/server";

// rbac-scope-enforced-in-handler: admin + store owner see all entries; user sees own only
export const GET = withProviders(
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

      const isStaff =
        user!.role === "admin" ||
        user!.role === "moderator" ||
        user!.role === "seller";
      const result = isStaff
        ? await getLotteryEntriesForAdmin("product", id, model)
        : await getLotteryEntriesForUser(user!.uid, model);

      return successResponse(result);
    },
  }),
);
