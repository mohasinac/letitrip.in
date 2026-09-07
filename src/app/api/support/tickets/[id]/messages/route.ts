import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  isAdminUser,
  isEmployeeUser,
  isModeratorUser,
  normalizeError,
  sendNotification,
  serverLogger,
  supportRepository,
} from "@mohasinac/appkit";

const schema = z.object({
  body: z.string().min(1).max(5000),
  newStatus: z.enum(["open", "in_progress", "waiting_on_user", "resolved", "closed"]).optional(),
  /**
   * Staff only: also email the ticket owner about this reply.
   *
   * 🛑 Default `false`, and honoured ONLY when the author is staff — enforced
   * below from the SESSION, never from this field. A user can set this to true
   * all day; it will not send anything.
   *
   * `support_ticket_update` is email-ineligible by design so routine ticket
   * back-and-forth costs nothing against the 100/day allowance. This is the
   * deliberate exception for the reply that genuinely has to reach an inbox,
   * and it is opt-in per reply rather than a standing setting so the cost is
   * always a decision someone made.
   */
  sendEmail: z.boolean().optional(),
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

      /*
       * The opt-in email, gated on `isStaff` — which is derived from the
       * session above, not from the request body. A user forcing
       * `sendEmail: true` gets the `&&` short-circuit and nothing else.
       *
       * `eligibilityOverride: "staff_requested"` bypasses
       * `EMAIL_ELIGIBLE_TYPES` for this one send and NOTHING else: the kill
       * switch, the daily ceiling and the recipient's own opt-out all still
       * apply, because a staff tick is a request rather than an override of
       * the site's posture or of what the user asked for.
       *
       * Fire-and-forget: the reply is already saved, and a mail failure must
       * not make the admin think their reply did not post.
       */
      if (isStaff && body!.sendEmail === true && ticket.userId) {
        void sendNotification({
          userId: ticket.userId,
          type: "support_ticket_update",
          priority: "normal",
          title: "New reply on your support ticket",
          message: body!.body.length > 300 ? `${body!.body.slice(0, 300)}…` : body!.body,
          relatedId: ticketId,
          relatedType: "support_ticket",
          eligibilityOverride: "staff_requested",
        }).catch((err: unknown) => {
          serverLogger.error("Ticket reply email failed (non-fatal — reply already saved)", {
            ticketId,
            error: normalizeError(err).message,
          });
        });
      }

      return successResponse(message, "Message sent", 201);
    },
  }),
);