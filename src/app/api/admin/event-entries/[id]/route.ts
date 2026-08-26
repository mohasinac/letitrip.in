import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  eventEntryRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const updateEntrySchema = z.object({
  status: z.enum(["CONFIRMED", "WAITLISTED", "CANCELLED"]).optional(),
});

/**
 * Read one entry. Added 2026-08-26 for `/admin/event-entries/[id]/view` —
 * this route had only a PATCH, so an admin could approve or cancel an entry
 * from a queue but had no way to link to one.
 *
 * `formResponses` is the survey/feedback submission being judged, and it is
 * the whole reason the detail surface exists: Root Cause #56's "acting blind"
 * shape was Approve/Reject offered on content nobody could read.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const entry = await eventEntryRepository.findById(id);
      if (!entry) return errorResponse("Entry not found", 404);
      return successResponse(entry);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateEntrySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateEntrySchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await eventEntryRepository.findById(id);
      if (!existing) return errorResponse("Entry not found", 404);
      const updated = await eventEntryRepository.update(id, body!);
      return successResponse(updated, "Entry updated");
    },
  }),
);