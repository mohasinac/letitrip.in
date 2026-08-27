/**
 * POST /api/reviews/[id]/vote — mark a review helpful.
 *
 * This file was previously a verbatim copy of the review LIST + review
 * SUBMISSION handlers: its POST called `createReview(...)` and returned
 * `201 "Review submitted"`, so every click of the helpful button wrote a new
 * review document, and `helpfulCount` was never incremented by anything.
 * It also exported a GET that ignored `[id]` entirely.
 */
import {
  createRouteHandler,
  errorResponse,
  successResponse,
  userRepository,
  voteReviewHelpful,
} from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const reviewId = typeof params?.id === "string" ? params.id : "";
      if (!reviewId) {
        return errorResponse("Review id is required", 400);
      }

      const userDoc = await userRepository.findById(user!.uid);
      if (userDoc && isSoftBanned(userDoc, "write_reviews")) {
        const ban = userDoc.softBans?.find((b) => b.action === "write_reviews");
        return errorResponse(
          `Your account is restricted from rating reviews. Reason: ${ban?.reason ?? "Policy violation"}.`,
          403,
        );
      }

      // Idempotent per user: a repeat vote returns counted:false and the
      // unchanged total rather than inflating it or erroring.
      const result = await voteReviewHelpful(reviewId, true, user!.uid);

      return successResponse(
        result,
        result.counted ? "Thanks for the feedback" : "You have already voted on this review",
      );
    },
  }),
);
