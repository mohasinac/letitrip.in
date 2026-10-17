import { withProviders } from "@/providers.config";
import { z } from "zod";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { reopenLotterySlotAction } from "@mohasinac/appkit/server";

/*
 * Reopening a slot un-books a pull a buyer has already paid for, so the three
 * fields are required rather than optional-with-a-runtime-check. `sourceType`
 * as a `z.enum` replaces a cast into a closed union — the old
 * `body.sourceType as "event" | "product"` accepted any string, and an
 * unrecognised one reached the action as a value it has no branch for.
 */
const reopenSlotSchema = z.object({
  sourceType: z.enum(["event", "product"]),
  sourceId: z.string().trim().min(1, "sourceId is required"),
  slotNumber: z.number().int().positive("slotNumber must be a slot number"),
});

export const POST = withProviders(
  createRouteHandler<(typeof reopenSlotSchema)["_output"]>({
    roles: ["admin"],
    permission: "admin:events:write",
    schema: reopenSlotSchema,
    handler: async ({ user, body }) => {
      const result = await reopenLotterySlotAction({
        ...body!,
        adminUserId: user!.uid,
      });

      if (!result.ok) return errorResponse(result.error ?? "Failed to reopen slot", 400);
      return successResponse(null, "Slot reopened");
    },
  }),
);
