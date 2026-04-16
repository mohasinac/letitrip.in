"use client";

import { useEventLeaderboard } from "../hooks/useEventLeaderboard";
import { EventLeaderboard as AppkitEventLeaderboard } from "@mohasinac/appkit/features/events";
import { THEME_CONSTANTS } from "@/constants";
import { Span, Text, Spinner } from "@mohasinac/appkit/ui";

import { useAuth } from "@/contexts/SessionContext";
import { useTranslations } from "next-intl";
import type { EventEntryDocument } from "@/db/schema";

interface EventLeaderboardProps {
  eventId: string;
  pointsLabel?: string;
}

const { themed, flex } = THEME_CONSTANTS;

const RANK_STYLES = [
  "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200",
  `bg-zinc-50 dark:bg-slate-800 border-zinc-200`,
  "bg-orange-50 dark:bg-orange-950/30 border-orange-200",
];

export function EventLeaderboard({
  eventId,
  pointsLabel = "Points",
}: EventLeaderboardProps) {
  const { user } = useAuth();
  const t = useTranslations("events");
  const { leaderboard, isLoading } = useEventLeaderboard(eventId);

  return (
    <AppkitEventLeaderboard
      isLoading={isLoading}
      isEmpty={!isLoading && (!leaderboard || leaderboard.length === 0)}
      labels={{
        title: t("leaderboard"),
        noEntries: t("noEntries"),
        points: pointsLabel,
      }}
      renderSkeleton={() => (
        <div className={`${flex.center} py-8`}>
          <Spinner />
        </div>
      )}
      renderEmpty={() => (
        <Text className={`text-sm ${themed.textSecondary} text-center py-4`}>
          {t("noEntries")}
        </Text>
      )}
      renderList={() => (
        <div className="space-y-2">
          <Text className="text-sm font-medium mb-3">{t("leaderboard")}</Text>
          {(leaderboard ?? []).map(
            (
              entry: EventEntryDocument & {
                userDisplayName?: string;
                points?: number;
                userId?: string;
              },
              idx: number,
            ) => {
              const isCurrentUser = user?.uid === entry.userId;
              const rankStyle = RANK_STYLES[idx] ?? "";
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${rankStyle} ${
                    isCurrentUser ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Span className="text-sm font-bold w-6 text-center text-zinc-500">
                    #{idx + 1}
                  </Span>
                  <div
                    className={`w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/15 ${flex.center} text-xs font-semibold text-primary shrink-0`}
                  >
                    {(entry.userDisplayName ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <Span className="text-sm flex-1">
                    {entry.userDisplayName ?? "Anonymous"}
                    {isCurrentUser && (
                      <Span className="ml-2 text-xs text-primary">(you)</Span>
                    )}
                  </Span>
                  <Span className="text-sm font-semibold">
                    {entry.points ?? 0} {pointsLabel}
                  </Span>
                </div>
              );
            },
          )}
        </div>
      )}
    />
  );
}

