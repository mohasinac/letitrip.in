import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  successResponse,
} from "@mohasinac/appkit";
import { flagLotteryEntryAction } from "@mohasinac/appkit/server";

export const PATCH = withProviders(
  createRouteHandler({
    roles: ["admin", "moderator"],
    handler: async ({ user, request, params }) => {
      const entryId = (params as { entryId: string }).entryId;
      const body = await parseJsonBody(request) as { flagNote?: string };

      if (!body.flagNote?.trim()) {
        return errorResponse("flagNote is required", 400);
      }

      const result = await flagLotteryEntryAction({
        entryId,
        flagNote: body.flagNote,
        flaggedByUserId: user!.uid,
      });

      if (!result.ok) return errorResponse(result.error ?? "Failed to flag entry", 400);
      return successResponse(result.data, "Entry flagged");
    },
  }),
);
