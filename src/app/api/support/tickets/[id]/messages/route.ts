import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  isAdminUser,
  isEmployeeUser,
  isModeratorUser,
  supportRepository,
} from "@mohasinac/appkit";

const schema = z.object({
  body: z.string().min(1).max(5000),
  newStatus: z.enum(["open", "in_progress", "waiting_on_user", "resolved", "closed"]).optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    schema,
    handler: async ({ user, params, body }) => {
      const ticketId = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(ticketId);
      if (!ticket) return errorResponse("Ticket not found", 404);

      const isOwner = ticket.userId === user!.uid;
      const isStaff =
        isAdminUser(user) ||
        isEmployeeUser(user) ||
        isModeratorUser(user);

      if (!isOwner && !isStaff) return errorResponse("Forbidden", 403);
      if (ticket.status === "closed") return errorResponse("This ticket is closed", 400);

      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        authorId: user!.uid,
        authorRole: isStaff ? ("support" as const) : ("user" as const),
        body: body!.body,
        createdAt: new Date(),
      };

      // `ticket` was already fetched above for the ownership + closed checks,
      // so passing it as `prior` keeps the status entry read-free (Rule #6).
      await supportRepository.addMessage(
        ticketId,
        message,
        body!.newStatus,
        {
          actor: { role: isStaff ? "admin" : "buyer", uid: user!.uid },
          trigger: "ticketReply",
        },
        ticket,
      );
      return successResponse(message, "Message sent", 201);
    },
  }),
);