import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next/request-helpers";
import { reviewRepository } from "@mohasinac/appkit";

/**
 * GET /api/user/reviews — the signed-in user's own reviews.
 *
 * 🛑 PAGINATED. It was not: `findByUser` returns every review the account has
 * ever written and all of them went out in one response, which Rule #6 forbids
 * for exactly the reason it gives — an unbounded list endpoint is one prolific
 * account away from blowing the function's memory and the response budget. The
 * three repository calls below are all unbounded reads, so the slice happens
 * here rather than in the query; that is a real cost and is bounded by the
 * page size rather than removed.
 *
 * `total` is the pre-slice length, so a caller can page without a second call.
 */
const DEFAULT_PAGE_SIZE = 20;
/** Rule #6's ceiling for any list endpoint. */
const MAX_PAGE_SIZE = 50;

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const sp = getSearchParams(request);
      const reviewerRole = getStringParam(sp, "reviewerRole") as
        | "buyer"
        | "seller"
        | null;
      const revieweeId = getStringParam(sp, "revieweeId");
      const page = clampInt(sp.get("page"), 1, 1, Number.MAX_SAFE_INTEGER);
      const pageSize = clampInt(
        sp.get("pageSize") ?? sp.get("perPage"),
        DEFAULT_PAGE_SIZE,
        1,
        MAX_PAGE_SIZE,
      );

      /*
       * `revieweeId` reads reviews ABOUT someone, which is public information —
       * `findByReviewee` filters `status == "approved"`, so a pending or
       * rejected review and its moderator notes are not reachable here. That
       * was worth checking rather than assuming, since the parameter is
       * caller-supplied and otherwise unguarded.
       */
      let reviews;
      if (revieweeId) {
        reviews = await reviewRepository.findByReviewee(revieweeId);
      } else if (reviewerRole === "buyer" || reviewerRole === "seller") {
        reviews = await reviewRepository.findByUserAsRole(
          user!.uid,
          reviewerRole,
        );
      } else {
        reviews = await reviewRepository.findByUser(user!.uid);
      }

      const total = reviews.length;
      const start = (page - 1) * pageSize;
      const items = reviews.slice(start, start + pageSize);

      return successResponse({
        /*
         * `reviews` is kept as the item key because existing callers read it;
         * renaming it is the half-finished-migration shape `audit-list-envelope`
         * exists to prevent (the view reads the old key, the route emits the
         * new one, and the list renders empty with a 200).
         */
        reviews: items,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    },
  }),
);
