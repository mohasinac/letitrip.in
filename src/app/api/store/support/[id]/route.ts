import { withProviders } from "@/providers.config";

/**
 * GET /api/store/support/[id]
 *
 * One support ticket raised about the caller's own store, with its thread.
 *
 * ## Why this had to exist before the list could be wired
 *
 * `SellerSupportView` showed a seller a ticket's subject and a 140-character
 * slice of its description with no way to open it — under a footer saying
 * "Replies and status changes happen in the ticket thread with our support
 * team", which linked nowhere. It was a dead-end list, and unlike most of the
 * ones fixed alongside it this was NOT a pure UI gap: `/api/store/support`
 * was GET-list-only and had no `[id]` sibling at all.
 *
 * 🛑 The buyer route `/api/support/tickets/[id]` could not be reused. It
 * authorises on `ticket.userId === caller`, which is the person who RAISED
 * the ticket — a buyer complaining about a seller. Pointing the seller at it
 * would 403 every time, and loosening its check would hand every seller read
 * access to tickets they are the subject of rather than a party to.
 *
 * ## The store comes from the SESSION, never the query string
 *
 * Same as the list route beside it: a `?storeId=` would let any seller read
 * any other seller's tickets.
 */

import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { supportRepository } from "@mohasinac/appkit/features/support/repository/support.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    /*
     * Roles alone, no `permission` — `getServerPermissions()` resolves
     * permissions only for `employee`, so a `permission` beside a seller role
     * is a guaranteed 403 for every seller. Ownership is the real gate and it
     * is enforced below. Mirrors the list route exactly.
     */
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) {
        return errorResponse("You do not have a store yet.", 404, { code: "NO_STORE" });
      }

      const id = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(id);

      /*
       * 🛑 A ticket belonging to someone else's store returns 404, not 403.
       * A 403 confirms the id exists, which turns this route into an oracle
       * for enumerating other sellers' ticket ids. The two cases are
       * deliberately indistinguishable to the caller.
       */
      if (!ticket || ticket.storeId !== store.id) {
        return errorResponse("Ticket not found.", 404, { code: "TICKET_NOT_FOUND" });
      }

      return successResponse({ ticket });
    },
  }),
);
