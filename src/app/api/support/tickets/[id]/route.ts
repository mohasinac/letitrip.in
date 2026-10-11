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

      return successResponse(ticket);
    },
  }),
);