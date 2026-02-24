/**
 * Public Event Leaderboard API Route
 * GET /api/events/[id]/leaderboard — Top 50 approved entries by points
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const GET = createApiHandler({
  auth: false,
  handler: async ({ request }: { request: NextRequest }) => {
    const parts = request.nextUrl.pathname.split("/");
    // path: /api/events/[id]/leaderboard
    const id = parts[parts.length - 2];

    const event = await eventRepository.findById(id);
    if (!event || event.status === "draft" || event.status === "paused") {
      throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);
    }

    if (event.type !== "survey" || !event.surveyConfig?.hasLeaderboard) {
      throw new ValidationError(ERROR_MESSAGES.EVENT.INVALID_TYPE);
    }

    const rawEntries = await eventEntryRepository.getLeaderboard(id, 50);

    // Strip sensitive fields
    const leaderboard = rawEntries.map(
      ({ userEmail: _em, ipAddress: _ip, formResponses: _fr, ...entry }) =>
        entry,
    );

    serverLogger.info("Event leaderboard requested", { eventId: id });

    return successResponse({
      leaderboard,
      pointsLabel: event.surveyConfig.pointsLabel ?? "Points",
    });
  },
});
