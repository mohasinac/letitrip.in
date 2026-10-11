import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { reviewRepository } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const sp = getSearchParams(request);
      const reviewerRole = getStringParam(sp, "reviewerRole") as "buyer" | "seller" | null;
      const revieweeId = getStringParam(sp, "revieweeId");

      let reviews;
      if (revieweeId) {
        reviews = await reviewRepository.findByReviewee(revieweeId);
      } else if (reviewerRole === "buyer" || reviewerRole === "seller") {
        reviews = await reviewRepository.findByUserAsRole(user!.uid, reviewerRole);
      } else {
        reviews = await reviewRepository.findByUser(user!.uid);
      }
      return successResponse({ reviews, total: reviews.length });
    },
  }),
);