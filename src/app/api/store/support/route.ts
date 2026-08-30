import { withProviders } from "@/providers.config";

/**
 * GET /api/store/support
 *
 * Every support ticket raised ABOUT the caller's own store.
 *
 * ## Why this could not exist before
 *
 * `SupportTicketDocument` had no top-level `storeId` — only
 * `relatedParties.storeId`, which is the admin's after-the-fact linkage and is
 * not in `SUPPORT_TICKET_INDEXED_FIELDS`, not in the repository's
 * `SIEVE_FIELDS`, and carries no composite index. So "the tickets about my
 * store" was not a question the data could answer, and no seller surface
 * existed in any form: no page, no route, no `ROUTES.STORE.SUPPORT`.
 *
 * ## The store comes from the SESSION, never the query string
 *
 * A `?storeId=` parameter would let any seller read any other seller's
 * tickets — the same shape as every other `/api/store/*` route, which all
 * resolve the store from the owner rather than accepting one.
 */

import {
  createRouteHandler,
  successResponse,
  errorResponse,
  supportRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    /*
     * Roles alone, no `permission`. `getServerPermissions()` resolves
     * permissions only for `employee`, so a `permission` field beside a
     * seller role is a guaranteed 403 for every seller — the route would have
     * been dead on arrival. Ownership is the real gate here anyway: the store
     * is resolved from the session below.
     */
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, request }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) {
        return errorResponse("You do not have a store yet.", 404, {
          code: "NO_STORE",
        });
      }

      const { searchParams } = new URL(request.url);
      const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
      const pageSize = Math.min(
        50,
        Math.max(1, Number(searchParams.get("pageSize") ?? "20")),
      );

      const result = await supportRepository.getStoreTickets(store.id, page, pageSize, {
        search: searchParams.get("q") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      });
      return successResponse(result);
    },
  }),
);
