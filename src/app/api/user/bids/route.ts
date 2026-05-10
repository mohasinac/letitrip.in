import { withProviders } from "@/providers.config";
import {
  bidRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const bids = await bidRepository.findByUser(user!.uid);
      return successResponse({ bids, total: bids.length });
    },
  }),
);
