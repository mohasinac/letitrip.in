import { withProviders } from "@/providers.config";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { reopenLotterySlotAction } from "@mohasinac/appkit/server";

export const POST = withProviders(
  createRouteHandler({
    roles: ["admin"],
    permission: "admin:events:write",
    handler: async ({ user, request }) => {
      const body = await parseJsonBody(request) as {
        sourceType?: "event" | "product";
        sourceId?: string;
        slotNumber?: number;
      };

      if (!body.sourceType || !body.sourceId || !body.slotNumber) {
        return errorResponse("sourceType, sourceId, and slotNumber are required", 400);
      }

      const result = await reopenLotterySlotAction({
        sourceType: body.sourceType,
        sourceId: body.sourceId,
        slotNumber: body.slotNumber,
        adminUserId: user!.uid,
      });

      if (!result.ok) return errorResponse(result.error ?? "Failed to reopen slot", 400);
      return successResponse(null, "Slot reopened");
    },
  }),
);
