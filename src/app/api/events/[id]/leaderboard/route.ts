/**
 * Public Event Leaderboard API Route
 * GET /api/events/[id]/leaderboard — Top 50 approved entries by points
 */

import { createRouteHandler } from "@mohasinac/appkit/next";
import { successResponse } from "@/lib/api-response";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError, ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";

export const GET = createRouteHandler<never, { id: string }>({
  auth: false,
  handler: async ({ params }) => {
    const id = params!.id;

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
