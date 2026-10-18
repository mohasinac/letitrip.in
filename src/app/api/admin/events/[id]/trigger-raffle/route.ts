import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  triggerEventRaffleAction,
  reasonToHttp,
} from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

const __POST__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:events:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await triggerEventRaffleAction({ eventId: id });
      if (!result.ok) {
        return errorResponse(result.error, 500);
      }
      const data = result.data;
      /*
       * A reason with no winner is a refusal. Statuses come from `reasonToHttp`,
       * shared with the Firebase callable handler.
       *
       * This route used to map EVERY reason to 409, including `event_not_found`,
       * while the handler mapped 404/422 — so the same refusal had two statuses
       * depending on which door it came through (Root Cause #85). More
       * importantly, the feature-flag branch in the core returned early with NO
       * reason, so it fell straight through to the success path below and
       * answered `200 "Raffle triggered"` with no winner. That gate is gone and
       * every non-success branch in the core now carries a reason.
       *
       * `already_triggered` is a 409 on purpose: the request is well formed and
       * the admin is not confused, the world simply already has a winner. The
       * CTA reads that code and disables itself rather than offering a second
       * draw that would produce two winners for one prize.
       */
      if (data.reason && !data.raffleWinnerUserId) {
        const { status, code, message } = reasonToHttp(data.reason);
        return errorResponse(message, status, { code });
      }
      return successResponse(data, "Raffle triggered");
    },
  }),
);

export const POST = __POST__g;
