import { cache } from "react";
import type { JsonValue } from "@mohasinac/appkit";
import { getPublicEventById, getEventLeaderboard, getEventPollResults, getEventSpinResults } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";

// The event itself is the subject of every route under /events/[id] — a failed
// read must not be handed to `if (!event) notFound()` as though the event were
// simply gone. The three result sets below ARE optional: each is one tab's rail.
export const getEventCached = cache(async (id: string) => {
  return getPublicEventById(id);
});

/**
 * The row shape below (`id` / `userDisplayName` / `points`) is what the
 * leaderboard page renders and is deliberately unchanged. What changed is where
 * the values come from: this used to cast the result to `{id, points}`, fields
 * appkit's `LeaderboardEntry` has never had (it carries `userId`/`totalPoints`),
 * so `id` resolved to `""` on every row — a duplicate React key — and `points`
 * to `undefined`. The cast compiled only because the old `.catch(() => [])`
 * widened the type with `never[]`; removing it is what surfaced the fiction.
 */
export const getLeaderboardCached = cache(async (id: string) => {
  const raw = await safeRead(() => getEventLeaderboard(id), {
    route: "/events/[id]/leaderboard",
    key: "eventEntries.getEventLeaderboard",
    fallback: [],
  });
  return raw.map((entry) => ({
    id: String(entry.userId ?? ""),
    userDisplayName:
      typeof entry.userDisplayName === "string" ? entry.userDisplayName : undefined,
    points: typeof entry.totalPoints === "number" ? entry.totalPoints : undefined,
  }));
});

export type LeaderboardEntry = Awaited<ReturnType<typeof getLeaderboardCached>>[number];

/**
 * Per-option vote tally for event.type === "poll" — replaces the generic
 * voter-ranked leaderboard, which is meaningless for a poll. See CLAUDE.md
 * Recurrent Root Cause Patterns / the leaderboard task note for why.
 */
export const getPollResultsCached = cache(async (id: string) => {
  const raw = (await safeRead(() => getEventPollResults(id), {
    route: "/events/[id]/leaderboard",
    key: "eventEntries.getEventPollResults",
    fallback: [],
  })) as Array<{
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
  const raw = (await safeRead(() => getEventSpinResults(id, 10), {
    route: "/events/[id]/leaderboard",
    key: "eventEntries.getEventSpinResults",
    fallback: [],
  })) as Array<{
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
