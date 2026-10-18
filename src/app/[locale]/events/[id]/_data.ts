import { cache } from "react";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { getPublicEventById, getEventLeaderboard, getEventPollResults, getEventSpinResults, getUserSpinResultsForEvent, hasUserEnteredEvent } from "@mohasinac/appkit/features/events/actions/event-actions";
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

/**
 * The viewer's OWN spins for an event, newest first.
 *
 * Separate from `getSpinResultsCached`, which is the public masked feed of
 * everyone's recent spins and cannot answer "what did I win". Cached on
 * `(id, userId)` so the page body and anything else in the same render share
 * one read — and keyed on the userId explicitly rather than reading the
 * session inside, because `React.cache` memoises per ARGUMENT LIST and a
 * function that hides its real input dedupes nothing (CLAUDE.md, React.cache
 * discipline).
 *
 * `safeRead` with an empty fallback: a spin history that fails to load must
 * degrade to "none shown" on a public event page, never take the route down —
 * and the failure is recorded as a DEGRADED_READ rather than swallowed.
 */
export const getUserSpinResultsCached = cache(async (id: string, userId: string) => {
  const raw = (await safeRead(() => getUserSpinResultsForEvent(id, userId), {
    route: "/events/[id]/spin-results",
    key: "eventEntries.getUserSpinResultsForEvent",
    fallback: [],
  })) as Array<{
    id: JsonValue;
    spinPrizeId?: JsonValue;
    spinPrizeTitle?: JsonValue;
    spinPrizeCouponCode?: JsonValue;
    spinWonAt?: JsonValue;
  }>;
  return raw.map((entry) => ({
    id: String(entry.id ?? ""),
    /*
     * `spinPrizeId` and `spinPrizeCouponCode` are carried through so the
     * participate page can render a returning viewer's existing win on first
     * paint. They were dropped here while the underlying action already
     * returned the id — so the two props `SpinWheelViewProps` declares for
     * exactly this (`initialPrizeId` / `initialCouponCode`) had nothing to be
     * fed from, and the page could not tell a spent spin from a fresh one.
     *
     * This is the caller's OWN result (the action takes a session-supplied
     * `userId`), which is why a coupon code may appear here and never in
     * `getSpinResultsCached`, the public masked feed.
     */
    spinPrizeId:
      typeof entry.spinPrizeId === "string" ? entry.spinPrizeId : undefined,
    spinPrizeTitle:
      typeof entry.spinPrizeTitle === "string" ? entry.spinPrizeTitle : undefined,
    spinPrizeCouponCode:
      typeof entry.spinPrizeCouponCode === "string"
        ? entry.spinPrizeCouponCode
        : undefined,
    spinWonAt: typeof entry.spinWonAt === "string" ? entry.spinWonAt : undefined,
  }));
});

export type MySpinResultRow = Awaited<ReturnType<typeof getUserSpinResultsCached>>[number];

/**
 * Has the signed-in viewer already entered this event?
 *
 * Lets the participate page render a raffle's already-entered state before the
 * user submits, instead of refusing them afterwards. `safeRead` with a `false`
 * fallback: if this read fails, show the form — the server-side dedupe in
 * `enterEvent` is the real guard, so the worst case is a refusal the page
 * failed to predict, never a duplicate entry.
 */
export const getHasEnteredCached = cache(async (id: string, userId: string) => {
  return safeRead(() => hasUserEnteredEvent(id, userId), {
    route: "/events/[id]/participate",
    key: "eventEntries.hasUserEnteredEvent",
    fallback: false,
  });
});
