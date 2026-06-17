import { cache } from "react";
import type { JsonValue } from "@mohasinac/appkit";
import { getPublicEventById, getEventLeaderboard } from "@mohasinac/appkit";

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
