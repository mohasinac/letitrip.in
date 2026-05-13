import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  supportRepository,
} from "@mohasinac/appkit";

const patchSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting_on_user", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "employee"],
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
    roles: ["admin", "employee"],
    permission: "admin:support-tickets:write",
    schema: patchSchema,
    handler: async ({ params, body }) => {
      const id = (params as { id: string }).id;
      const ticket = await supportRepository.getTicketById(id);
      if (!ticket) return errorResponse("Ticket not found", 404);

      const updated = await supportRepository.updateTicketStatus(id, body! as any);
      return successResponse(updated, "Ticket updated");
    },
  }),
);
