import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  eventEntryRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updateEntrySchema = z.object({
  status: z.enum(["CONFIRMED", "WAITLISTED", "CANCELLED"]).optional(),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof updateEntrySchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:event-entries:write",
    schema: updateEntrySchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await eventEntryRepository.findById(id);
      if (!existing) return errorResponse("Entry not found", 404);
      const updated = await eventEntryRepository.update(id, body! as any);
      return successResponse(updated, "Entry updated");
    },
  }),
);
