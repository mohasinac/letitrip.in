import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  supportRepository,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const ticketId = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(ticketId);
      if (!ticket) return errorResponse("Ticket not found", 404);

      const isOwner = ticket.userId === user!.uid;
      const isStaff =
        user!.role === "admin" ||
        user!.role === "employee" ||
        user!.role === "moderator";
      if (!isOwner && !isStaff) return errorResponse("Forbidden", 403);

      return successResponse(ticket);
    },
  }),
);
