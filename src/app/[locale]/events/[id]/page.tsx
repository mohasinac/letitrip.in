import {
  EventDetailView,
  getPublicEventById,
  getEventLeaderboard,
  Div,
  Heading,
  RichText,
  Text,
  ROUTES,
} from "@mohasinac/appkit";
import type { Metadata } from "next";
import Link from "next/link";
import { ShareEventButton } from "./ShareEventButton";
import { PollInlineClient } from "./PollInlineClient";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id).catch(() => null);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description?.slice(0, 155),
  };
}

const TYPE_BADGE: Record<string, string> = {
  sale:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  offer:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  poll:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  survey:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  feedback: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ended:  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  draft:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
};

function formatDate(value: unknown): string {
  if (!value) return "";
  try {
    return new Date(value as unknown as string).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });
  } catch {
    return String(value);
  }
}

export default async function Page({ params }: Props) {
  const { locale, id } = await params;
  const [event, leaderboard] = await Promise.all([
    getPublicEventById(id).catch(() => null),
    getEventLeaderboard(id).catch(() => []),
  ]);

  if (!event) {
    return (
      <Div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Event Not Found
        </Heading>
        <Text className="mt-2 text-zinc-500 dark:text-zinc-400">
          This event may have ended or does not exist.
        </Text>
        <Link
          href={`/${locale}${String(ROUTES.PUBLIC.EVENTS)}`}
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Browse Events
        </Link>
      </Div>
    );
  }

  const e = event as unknown as Record<string, unknown>;
  const coverImage =
    typeof e.imageUrl === "string" ? e.imageUrl
    : typeof e.bannerImage === "string" ? e.bannerImage
    : null;

  const eventType   = (event.type   as string | undefined) ?? "";
  const eventStatus = (event.status as string | undefined) ?? "";
  const typeBadgeCls   = TYPE_BADGE[eventType]   ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  const statusBadgeCls = STATUS_BADGE[eventStatus] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  const totalEntries = (event as any).stats?.totalEntries as number | undefined;

  const now      = Date.now();
  const endsAt   = event.endsAt   ? new Date(event.endsAt as unknown as string).getTime()   : null;
  const isActive = eventStatus === "active" || (endsAt !== null && endsAt > now);

  return (
    <EventDetailView
      renderCoverImage={
        coverImage
          ? () => (
              <Div className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={event.title ?? "Event cover"}
                  className="w-full object-cover max-h-72"
                />
              </Div>
            )
          : undefined
      }
      renderHeader={() => (
        <Div className="space-y-3">
          {/* Type + Status badges */}
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

          {/* Title */}
          <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {event.title}
          </Heading>

          {/* Dates */}
          <Div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {event.startsAt ? (
              <span>Start: <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatDate(event.startsAt)}</span></span>
            ) : null}
            {event.endsAt ? (
              <span>End: <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatDate(event.endsAt)}</span></span>
            ) : null}
            {totalEntries !== undefined ? (
              <span>Participants: <span className="font-medium text-zinc-700 dark:text-zinc-300">{totalEntries.toLocaleString()}</span></span>
            ) : null}
          </Div>

          {/* Share */}
          <Div className="flex items-center gap-2 pt-1">
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">Share:</Text>
            <ShareEventButton />
          </Div>
        </Div>
      )}
      renderContent={() => {
        const pollCfg = (event as any).pollConfig as {
          options: { id: string; label: string }[];
          allowMultiSelect: boolean;
          allowComment: boolean;
          requireLogin?: boolean;
        } | undefined;
        return (
          <div className="space-y-6">
            {event.description ? (
              <RichText
                html={typeof event.description === "string" ? event.description : ""}
                className="text-zinc-600 dark:text-zinc-400"
              />
            ) : null}
            {pollCfg?.options?.length ? (
              <div className="space-y-3">
                <Heading level={2} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Cast Your Vote
                </Heading>
                <PollInlineClient
                  eventId={event.id}
                  pollConfig={pollCfg}
                  isActive={isActive}
                />
              </div>
            ) : null}
          </div>
        );
      }}
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
                  href={`/${locale}${String(ROUTES.PUBLIC.EVENT_PARTICIPATE(id))}`}
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
