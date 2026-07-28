import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  bidRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

// audit-pagesize-ok: pageSize clamped via PAGE_SIZE constant (25 <= Vercel Hobby cap of 50)
const PAGE_SIZE = 25;

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
const __GET__g = withProviders(
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

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const GET = withFeatureGuard("AUCTIONS", __GET__g);
