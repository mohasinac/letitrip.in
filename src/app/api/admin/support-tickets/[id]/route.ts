import { withProviders } from "@/providers.config";
import { z } from "zod";
import { supportRepository } from "@mohasinac/appkit/features/support/repository/support.repository";
import { TicketStatusValues, TicketPriorityValues } from "@mohasinac/appkit/features/support/schemas/firestore";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
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
      /*
       * 🛑 MASKED. `SupportRepository` does not decrypt on read, so the
       * reporter's own contact details reached the response as `enc:v1:`
       * blobs. Root Cause #38: the list route uses the accessor, the
       * single-item sibling did not.
       *
       * Masked rather than revealed even here, where the role is
       * `ROLES_TRUST_SAFETY`: a moderator triaging a ticket reads the
       * MESSAGE, and whoever needs to reply by email should go through a
       * named plaintext read rather than every ticket view carrying one.
       */
      return successResponse(supportRepository.maskedTicket(ticket));
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
