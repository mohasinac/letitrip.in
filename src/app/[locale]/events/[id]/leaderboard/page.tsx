import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Heading, Text } from "@mohasinac/appkit/ui";
import { EVENT_LABELS, EVENT_META } from "../_constants";
import { getEventCached, getLeaderboardCached } from "../_data";

export const revalidate = 60;

type RouteParams = { locale: string; id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  return {
    title: event
      ? EVENT_META.LEADERBOARD_TITLE(event.title ?? "")
      : EVENT_META.NOT_FOUND_TITLE,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const [event, leaderboard] = await Promise.all([
    getEventCached(id),
    getLeaderboardCached(id),
  ]);
  if (!event) notFound();

  if (leaderboard.length === 0) {
    return (
      <Div className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-10 text-center">
        <Text className="text-zinc-500 dark:text-zinc-400">
          {EVENT_LABELS.LEADERBOARD_EMPTY}
        </Text>
      </Div>
    );
  }

  return (
    <Div className="space-y-2">
      <Heading
        level={2}
        className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {EVENT_LABELS.LEADERBOARD_HEADING}
      </Heading>
      {leaderboard.slice(0, EVENT_META.LEADERBOARD_VISIBLE_LIMIT).map((entry, idx) => (
        <Div
          key={entry.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-700"
        >
          <Text className="font-medium text-zinc-700 dark:text-zinc-300">
            #{idx + 1} {entry.userDisplayName ?? EVENT_LABELS.PARTICIPANT_FALLBACK}
          </Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            {entry.points ?? 0} {EVENT_LABELS.POINTS_SUFFIX}
          </Text>
        </Div>
      ))}
    </Div>
  );
}
