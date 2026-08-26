import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  supportRepository,
  TicketStatusValues,
  TicketPriorityValues,
} from "@mohasinac/appkit";
import { ROLES_TRUST_SAFETY } from "@/constants";

const patchSchema = z.object({
  // Derived from the runtime maps rather than restated — see the scammers
  // route for why. `field-names.ts` carried a fictitious `medium` priority
  // for exactly this reason.
  status: z.enum(TicketStatusValues).optional(),
  priority: z.enum(TicketPriorityValues).optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  internalNotes: z.string().optional(),
  // ST-6 — admin/support assignable subject pointers
  relatedParties: z
    .object({
      userId: z.string().optional(),
      storeId: z.string().optional(),
      orderId: z.string().optional(),
      productId: z.string().optional(),
      bidId: z.string().optional(),
    })
    .optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_TRUST_SAFETY],
    permission: "admin:support-tickets:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(id);
      if (!ticket) return errorResponse("Ticket not found", 404);
      return successResponse(ticket);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof patchSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_TRUST_SAFETY],
    permission: "admin:support-tickets:write",
    schema: patchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(id);
      if (!ticket) return errorResponse("Ticket not found", 404);

      // `ticket` is threaded through as `prior`, so the timeline entry costs
      // no second read of a document this handler already holds (Rule #6).
      const updated = await supportRepository.updateTicketStatus(
        id,
        body!,
        { actor: { role: "admin", uid: user?.uid }, trigger: "adminUpdateTicket" },
        ticket,
      );
      return successResponse(updated, "Ticket updated");
    },
  }),
);
