import { withProviders } from "@/providers.config";
import { isAdminUser, isEmployeeUser, isModeratorUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { supportRepository } from "@mohasinac/appkit/features/support/repository/support.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const ticketId = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(ticketId);
      if (!ticket) return errorResponse("Ticket not found", 404);

      const isOwner = ticket.userId === user!.uid;
      const isStaff =
        isAdminUser(user) ||
        isEmployeeUser(user) ||
        isModeratorUser(user);
      if (!isOwner && !isStaff) return errorResponse("Forbidden", 403);

      /*
       * 🛑 PER VIEWER, and this route is the one place in the sweep where the
       * answer genuinely differs by who is asking.
       *
       * `SupportRepository` does not decrypt on read, so this returned
       * `enc:v1:` blobs to BOTH audiences — the reporter saw their own
       * contact details as ciphertext, and staff saw the same.
       *
       * The owner gets plaintext: it is their own detail, and the two
       * branches above have already established which. Staff get the masked
       * variant, because a moderator triaging a ticket reads the MESSAGE —
       * identifying the reporter is enough, and every ticket view carrying a
       * live email address is exactly the standing exposure the
       * ciphertext-by-default migration exists to remove.
       */
      return successResponse(
        isOwner
          ? supportRepository.revealTicket(ticket)
          : supportRepository.maskedTicket(ticket),
      );
    },
  }),
);