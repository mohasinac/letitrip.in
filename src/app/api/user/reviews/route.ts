import { withProviders } from "@/providers.config";
import {
  reviewRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const reviews = await reviewRepository.findByUser(user!.uid);
      return successResponse({ reviews, total: reviews.length });
    },
  }),
);