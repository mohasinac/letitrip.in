"use client";
import {
  EventDetailView,
  Div,
  Heading,
  RichText,
  Text,
  ROUTES,
} from "@mohasinac/appkit";
import Link from "next/link";
import { ShareEventButton } from "./ShareEventButton";
import { PollInlineClient } from "./PollInlineClient";

type PollConfig = {
  options: { id: string; label: string }[];
  allowMultiSelect: boolean;
  allowComment: boolean;
  requireLogin?: boolean;
};

type LeaderboardEntry = {
  id: string;
  userDisplayName?: string;
  points?: number;
};

type Props = {
  eventId: string;
  locale: string;
  coverImage: string | null;
  eventType: string;
  eventStatus: string;
  typeBadgeCls: string;
  statusBadgeCls: string;
  totalEntries?: number;
  isActive: boolean;
  title: string;
  description: string;
  startsAtFormatted: string;
  endsAtFormatted: string;
  pollConfig?: PollConfig;
  leaderboard: LeaderboardEntry[];
};

export function EventDetailClient({
  eventId,
  locale,
  coverImage,
  eventType,
  eventStatus,
  typeBadgeCls,
  statusBadgeCls,
  totalEntries,
  isActive,
  title,
  description,
  startsAtFormatted,
  endsAtFormatted,
  pollConfig,
  leaderboard,
}: Props) {
  return (
    <EventDetailView
      renderCoverImage={
        coverImage
          ? () => (
              <Div className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={title ?? "Event cover"}
                  className="w-full object-cover max-h-72"
                />
              </Div>
            )
          : undefined
      }
      renderHeader={() => (
        <Div className="space-y-3">
          <Div className="flex flex-wrap items-center gap-2">
            {eventType ? (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${typeBadgeCls}`}>
                {eventType}
              </span>
            ) : null}
            {eventStatus ? (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeCls}`}>
                {eventStatus}
              </span>
            ) : null}
          </Div>

          <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </Heading>

          <Div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {startsAtFormatted ? (
              <span>
                Start: <span className="font-medium text-zinc-700 dark:text-zinc-300">{startsAtFormatted}</span>
              </span>
            ) : null}
            {endsAtFormatted ? (
              <span>
                End: <span className="font-medium text-zinc-700 dark:text-zinc-300">{endsAtFormatted}</span>
              </span>
            ) : null}
            {totalEntries !== undefined ? (
              <span>
                Participants: <span className="font-medium text-zinc-700 dark:text-zinc-300">{totalEntries.toLocaleString()}</span>
              </span>
            ) : null}
          </Div>

          <Div className="flex items-center gap-2 pt-1">
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">Share:</Text>
            <ShareEventButton />
          </Div>
        </Div>
      )}
      renderContent={() => (
        <div className="space-y-6">
          {description ? (
            <RichText html={description} className="text-zinc-600 dark:text-zinc-400" />
          ) : null}
          {pollConfig?.options?.length ? (
            <div className="space-y-3">
              <Heading level={2} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Cast Your Vote
              </Heading>
              <PollInlineClient
                eventId={eventId}
                pollConfig={pollConfig}
                isActive={isActive}
              />
            </div>
          ) : null}
        </div>
      )}
      renderLeaderboard={
        leaderboard.length > 0
          ? () => (
              <Div className="space-y-2">
                <Heading level={2} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Leaderboard
                </Heading>
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <Div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-700"
                  >
                    <Text className="font-medium text-zinc-700 dark:text-zinc-300">
                      #{idx + 1} {entry.userDisplayName ?? "Participant"}
                    </Text>
                    <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                      {entry.points ?? 0} pts
                    </Text>
                  </Div>
                ))}
              </Div>
            )
          : undefined
      }
      renderParticipateAction={
        eventType === "poll"
          ? undefined
          : () =>
              isActive ? (
                <Link
                  href={`/${locale}${String(ROUTES.PUBLIC.EVENT_PARTICIPATE(eventId))}`}
                  className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  Participate Now
                </Link>
              ) : (
                <Div className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-5 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                  This event has ended.
                </Div>
              )
      }
    />
  );
}
