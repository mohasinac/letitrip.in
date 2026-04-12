/**
 * Admin Event Stats API Route
 * GET /api/admin/events/[id]/stats — Summary stats, poll results, leaderboard
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@mohasinac/appkit/errors";
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

    // For poll events: compute results per option (paginate to tally all votes)
    let pollResults: {
      optionId: string;
      label: string;
      count: number;
      percent: number;
    }[] = [];
    if (event.type === "poll" && event.pollConfig) {
      // Paginate through all entries to ensure complete vote tally
      let allEntries: unknown[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 50) {
        // Safety limit: max 50 pages = 50k entries
        const result = await eventEntryRepository.listForEvent(id, {
          page,
          pageSize: 1000,
          sorts: "-submittedAt",
        });
        allEntries.push(...result.items);
        hasMore = result.hasMore;
        page += 1;
      }

      // Tally votes across all entries
      const voteCounts: Record<string, number> = {};
      for (const entry of allEntries) {
        for (const optionId of (entry as any).pollVotes ?? []) {
          voteCounts[optionId] = (voteCounts[optionId] ?? 0) + 1;
        }
      }

      const total = allEntries.length || 1;
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
