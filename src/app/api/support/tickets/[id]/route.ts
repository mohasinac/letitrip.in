import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  isAdminUser,
  isEmployeeUser,
  isModeratorUser,
  supportRepository,
} from "@mohasinac/appkit";

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