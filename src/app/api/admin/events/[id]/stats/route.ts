/**
 * Admin Event Stats API Route
 * GET /api/admin/events/[id]/stats — Summary stats, poll results, leaderboard
 */

import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const GET = createRouteHandler<never, { id: string }>({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ params }) => {
    const id = params!.id;

    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);

    const { totalEntries, approvedEntries, flaggedEntries } = event.stats;
    const pendingEntries = totalEntries - approvedEntries - flaggedEntries;

    // For poll events: compute results per option
    let pollResults: {
      optionId: string;
      label: string;
      count: number;
      percent: number;
    }[] = [];
    if (event.type === "poll" && event.pollConfig) {
      // Fetch all entries for this event and tally votes
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

    // For survey events with leaderboard: top 10 entries
    let leaderboard: unknown[] = [];
    if (event.type === "survey" && event.surveyConfig?.hasLeaderboard) {
      leaderboard = await eventEntryRepository.getLeaderboard(id, 10);
    }

    serverLogger.info("Admin event stats requested", { eventId: id });

    return successResponse({
      event,
      totalEntries,
      approvedEntries,
      flaggedEntries,
      pendingEntries,
      pollResults,
      leaderboard,
    });
  },
});
