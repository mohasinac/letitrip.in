import { withProviders } from "@/providers.config";
import {
  bidRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const PAGE_SIZE = 25;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const pageSize = Math.min(PAGE_SIZE, Math.max(1, Number(url.searchParams.get("pageSize") ?? PAGE_SIZE)));
      const { items: bids, hasMore } = await bidRepository.findByUserPaginated(user!.uid, pageSize);
      return successResponse({ bids, total: bids.length, pageSize, hasMore });
    },
  }),
);
