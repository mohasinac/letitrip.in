import { withProviders } from "@/providers.config";
import { z } from "zod";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { flagLotteryEntryAction } from "@mohasinac/appkit/server";

/*
 * A moderator's note on a suspicious entry. `.min(5)` because the note is the
 * only record of WHY an entry was flagged — the previous `!body.flagNote?.trim()`
 * check accepted a single character, and accepted a non-string by casting.
 */
const flagSchema = z.object({
  flagNote: z.string().trim().min(5, "Say what looks wrong").max(1000),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof flagSchema)["_output"]>({
    roles: ["admin", "moderator"],
    schema: flagSchema,
    handler: async ({ user, body, params }) => {
      const entryId = (params as { entryId: string }).entryId;

      const result = await flagLotteryEntryAction({
        entryId,
        flagNote: body!.flagNote,
        flaggedByUserId: user!.uid,
      });

      if (!result.ok) return errorResponse(result.error ?? "Failed to flag entry", 400);
      return successResponse(result.data, "Entry flagged");
    },
  }),
);
