import { withProviders } from "@/providers.config";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
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
