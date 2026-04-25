import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  eventEntryRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

const reviewEntrySchema = z.object({
  status: z.enum(["approved", "rejected", "flagged"]),
  reviewNote: z.string().optional(),
  points: z.number().optional(),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof reviewEntrySchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: reviewEntrySchema,
    handler: async ({ body, params }) => {
      const { id: eventId, entryId } = params as { id: string; entryId: string };
      await eventEntryRepository.reviewEntry(entryId, body!.status as any, "admin", body!.reviewNote);
      return successResponse({ entryId, eventId, ...body }, "Entry reviewed");
    },
  }),
);
