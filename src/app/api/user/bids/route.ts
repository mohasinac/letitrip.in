import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  bidRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants/api-roles";

const MAX_PAGE_SIZE = 50;

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_AUTHENTICATED,
    permission: "bids:read",
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get("pageSize") ?? MAX_PAGE_SIZE)));
      const { items: bids, hasMore } = await bidRepository.findByUserPaginated(user!.uid, pageSize);
      return successResponse({ bids, total: bids.length, pageSize, hasMore });
    },
  }),
);

export const GET = withFeatureGuard("AUCTIONS", __GET__g);
