import { withProviders } from "@/providers.config";
/**
 * Admin Gateway Events API — the webhook inbox.
 *
 * `GET`   — list, Sieve-filtered (this collection does declare `SIEVE_FIELDS`).
 * `PATCH` — reopen one event so the NEXT delivery is accepted.
 *
 * ## 🛑 PATCH does NOT reprocess, and the response says so
 *
 * Nothing outside `src/app/api/payment/webhook/route.ts` knows how to handle a
 * gateway event. Dispatching from here would duplicate that route's whole
 * switch and its RTDB signalling in a second place — Root Cause #75 on the
 * dispatch axis, and R1's own header refuses to do it for the same reason.
 *
 * So this clears the terminal flag, the attempt count and the lease, which is
 * what stops `resolveDuplicateDelivery` from acking the next delivery as a
 * duplicate. The operator still presses Resend in the gateway dashboard. The
 * response carries `reprocessed: false` and `nextStep` precisely so a caller
 * cannot mistake one for the other.
 *
 * Under `maintenance/` and gated on `admin:maintenance:view-gateway-events`,
 * which `maintenance_employee` DOES hold — unlike the payment-case
 * permissions. A stuck event is a diagnostic with no external clock; the case
 * it produces is what carries urgency.
 */
import { gatewayEventsRepository } from "@mohasinac/appkit/features/gateway-events/repository/gateway-events.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next/request-helpers";
import { ROLES_ANY_STAFF } from "@/constants";
import { z } from "zod";

/*
 * `receivedAt` DESC. 🛑 Not `processedAt`, which is optional — a Firestore
 * `orderBy` excludes every document lacking the ordering field (Root Cause
 * #100), so it would hide exactly the unsettled events worth looking at. And
 * not `status`, which is `canSort: false` and would be dropped silently.
 */
const DEFAULT_SORTS = "-receivedAt";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ANY_STAFF],
    permission: "admin:maintenance:view-gateway-events",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

      const result = await gatewayEventsRepository().list({
        ...(filters ? { filters } : {}),
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        items: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
    },
  }),
);

const reopenSchema = z.object({ id: z.string().min(1).max(1500) }).strict();

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof reopenSchema>>({
    auth: true,
    roles: [...ROLES_ANY_STAFF],
    permission: "admin:maintenance:view-gateway-events",
    schema: reopenSchema,
    handler: async ({ user, body }) => {
      await gatewayEventsRepository().reopenForRedelivery(body!.id, user!.uid);
      return successResponse({
        id: body!.id,
        reopened: true,
        /*
         * Stated in the payload, not only in the UI copy. A future caller of
         * this endpoint — a script, another page — must not be able to read a
         * 200 here as "the event was handled".
         */
        reprocessed: false,
        nextStep:
          "Press Resend on this delivery in the gateway dashboard, or wait for the gateway's own retry. Nothing outside the webhook route can replay an event.",
      });
    },
  }),
);
