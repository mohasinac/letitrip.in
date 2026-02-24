/**
 * Public Event Detail API Route
 * GET /api/events/[id] — Single event (active or ended only, not draft/paused)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const GET = createApiHandler({
  auth: false,
  handler: async ({ request }: { request: NextRequest }) => {
    const id = request.nextUrl.pathname.split("/").at(-1)!;
    const event = await eventRepository.findById(id);

    if (!event || event.status === "draft" || event.status === "paused") {
      throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);
    }

    // Strip internal fields
    const { createdBy: _cb, ...publicEvent } = event;

    // For poll events with resultsVisibility='always': include current results
    let pollResults: {
      optionId: string;
      label: string;
      count: number;
      percent: number;
    }[] = [];
    if (
      event.type === "poll" &&
      event.pollConfig?.resultsVisibility === "always"
    ) {
      const allEntriesResult = await eventEntryRepository.listForEvent(id, {
        page: 1,
        pageSize: 1000,
        sorts: "-submittedAt",
      });

      const voteCounts: Record<string, number> = {};
      for (const entry of allEntriesResult.items) {
        for (const optionId of entry.pollVotes ?? []) {
          voteCounts[optionId] = (voteCounts[optionId] ?? 0) + 1;
        }
      }

      const total = allEntriesResult.total || 1;
      pollResults = event.pollConfig.options.map((opt) => ({
        optionId: opt.id,
        label: opt.label,
        count: voteCounts[opt.id] ?? 0,
        percent: Math.round(((voteCounts[opt.id] ?? 0) / total) * 100),
      }));
    }

    // For survey events with leaderboard: include top 10 approved entries
    let leaderboard: unknown[] = [];
    if (event.type === "survey" && event.surveyConfig?.hasLeaderboard) {
      const rawLeaderboard = await eventEntryRepository.getLeaderboard(id, 10);
      leaderboard = rawLeaderboard.map(
        ({ userId: _uid, userEmail: _em, ipAddress: _ip, ...entry }) => entry,
      );
    }

    serverLogger.info("Public event detail requested", { eventId: id });

    return successResponse({ ...publicEvent, pollResults, leaderboard });
  },
});
