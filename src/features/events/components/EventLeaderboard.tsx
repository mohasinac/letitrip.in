"use client";

import { useEventLeaderboard } from "../hooks/useEventLeaderboard";
import { THEME_CONSTANTS } from "@/constants";
import { Spinner } from "@/components";
import { useAuth } from "@/hooks";
import { useTranslations } from "next-intl";
import type { EventEntryDocument } from "@/db/schema";

interface EventLeaderboardProps {
  eventId: string;
  pointsLabel?: string;
}

const { themed } = THEME_CONSTANTS;

export function EventLeaderboard({
  eventId,
  pointsLabel = "Points",
}: EventLeaderboardProps) {
  const { user } = useAuth();
  const t = useTranslations("events");

  const { leaderboard, isLoading } = useEventLeaderboard(eventId);

  const RANK_STYLES = [
    "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200",
    "bg-gray-50 dark:bg-gray-800/50 border-gray-200",
    "bg-orange-50 dark:bg-orange-950/30 border-orange-200",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <p className={`text-sm ${themed.textSecondary} text-center py-4`}>
        No entries yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium mb-3">{t("leaderboard")}</p>
      {leaderboard.map((entry, idx) => {
        const isCurrentUser = user?.uid === entry.userId;
        const rankStyle = RANK_STYLES[idx] ?? "";
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${rankStyle} ${
              isCurrentUser ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            <span className="text-sm font-bold w-6 text-center text-gray-500">
              #{idx + 1}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">
              {(entry.userDisplayName ?? "U").charAt(0).toUpperCase()}
            </div>
            <span className="text-sm flex-1">
              {entry.userDisplayName ?? "Anonymous"}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-indigo-600">(you)</span>
              )}
            </span>
            <span className="text-sm font-semibold">
              {entry.points ?? 0} {pointsLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
