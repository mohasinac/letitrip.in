import { cache } from "react";
import { getPublicEventById, getEventLeaderboard } from "@mohasinac/appkit";

export const getEventCached = cache(async (id: string) => {
  return getPublicEventById(id).catch(() => null);
});

export const getLeaderboardCached = cache(async (id: string) => {
  const raw = (await getEventLeaderboard(id).catch(() => [])) as Array<{
    id: unknown;
    userDisplayName?: unknown;
    points?: unknown;
  }>;
  return raw.map((entry) => ({
    id: String(entry.id ?? ""),
    userDisplayName:
      typeof entry.userDisplayName === "string" ? entry.userDisplayName : undefined,
    points: typeof entry.points === "number" ? entry.points : undefined,
  }));
});

export type LeaderboardEntry = Awaited<ReturnType<typeof getLeaderboardCached>>[number];
