import { cache } from "react";
import type { JsonValue } from "@mohasinac/appkit";
import { getPublicEventById, getEventLeaderboard, getEventPollResults, getEventSpinResults } from "@mohasinac/appkit";

export const getEventCached = cache(async (id: string) => {
  return getPublicEventById(id).catch(() => null);
});

export const getLeaderboardCached = cache(async (id: string) => {
  const raw = (await getEventLeaderboard(id).catch(() => [])) as Array<{
    id: JsonValue;
    userDisplayName?: JsonValue;
    points?: JsonValue;
  }>;
  return raw.map((entry) => ({
    id: String(entry.id ?? ""),
    userDisplayName:
      typeof entry.userDisplayName === "string" ? entry.userDisplayName : undefined,
    points: typeof entry.points === "number" ? entry.points : undefined,
  }));
});

export type LeaderboardEntry = Awaited<ReturnType<typeof getLeaderboardCached>>[number];

/**
 * Per-option vote tally for event.type === "poll" — replaces the generic
 * voter-ranked leaderboard, which is meaningless for a poll. See CLAUDE.md
 * Recurrent Root Cause Patterns / the leaderboard task note for why.
 */
export const getPollResultsCached = cache(async (id: string) => {
  const raw = (await getEventPollResults(id).catch(() => [])) as Array<{
    optionId: JsonValue;
    label?: JsonValue;
    count?: JsonValue;
    percent?: JsonValue;
  }>;
  return raw.map((result) => ({
    optionId: String(result.optionId ?? ""),
    label: typeof result.label === "string" ? result.label : "",
    count: typeof result.count === "number" ? result.count : 0,
    percent: typeof result.percent === "number" ? result.percent : 0,
  }));
});

export type PollResultRow = Awaited<ReturnType<typeof getPollResultsCached>>[number];

/** Last 10 winning spins for a spin_wheel event — see getEventSpinResults for the join logic. */
export const getSpinResultsCached = cache(async (id: string) => {
  const raw = (await getEventSpinResults(id, 10).catch(() => [])) as Array<{
    id: JsonValue;
    userDisplayName?: JsonValue;
    isGuest?: JsonValue;
    spinPrizeId?: JsonValue;
    spinPrizeTitle?: JsonValue;
    spinWonAt?: JsonValue;
  }>;
  return raw.map((entry) => ({
    id: String(entry.id ?? ""),
    userDisplayName:
      typeof entry.userDisplayName === "string" ? entry.userDisplayName : undefined,
    isGuest: Boolean(entry.isGuest),
    spinPrizeTitle:
      typeof entry.spinPrizeTitle === "string" ? entry.spinPrizeTitle : undefined,
    spinWonAt: typeof entry.spinWonAt === "string" ? entry.spinWonAt : undefined,
  }));
});

export type SpinResultRow = Awaited<ReturnType<typeof getSpinResultsCached>>[number];
