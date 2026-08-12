import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  eventEntryRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const reviewEntrySchema = z.object({
  status: z.enum(["approved", "rejected", "flagged"]),
  reviewNote: z.string().optional(),
  points: z.number().optional(),
});

// rbac-scope-enforced-in-handler: admin role enforced via createApiHandler
const __PATCH__g = withProviders(
  createRouteHandler<(typeof reviewEntrySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:events:write",
    schema: reviewEntrySchema,
    handler: async ({ body, params, user }) => {
      const { id: eventId, entryId } = params as { id: string; entryId: string };
      await eventEntryRepository.reviewEntry(
        entryId,
        body!.status as any,
        user?.uid ?? "admin",
        body!.reviewNote,
        body!.points,
      );
      return successResponse({ entryId, eventId, ...body }, "Entry reviewed");
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const PATCH = withFeatureGuard("EVENTS", __PATCH__g);
