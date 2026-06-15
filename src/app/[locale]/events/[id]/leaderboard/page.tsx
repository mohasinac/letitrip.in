import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Heading, Row, Text } from "@mohasinac/appkit/ui";
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
      <Div className="dark:border-zinc-700 px-6 py-10 text-center" rounded="xl" border="default">
        <Text color="muted">
          {EVENT_LABELS.LEADERBOARD_EMPTY}
        </Text>
      </Div>
    );
  }

  return (
    <Div className="space-y-2">
      <Heading
        level={2} size="lg" weight="semibold" color="primary">
        {EVENT_LABELS.LEADERBOARD_HEADING}
      </Heading>
      {leaderboard.slice(0, EVENT_META.LEADERBOARD_VISIBLE_LIMIT).map((entry, idx) => (
        <Row
          key={entry.id}
          className="px-4 py-2 dark:border-zinc-700" align="center" justify="between" rounded="lg" border="default"
        >
          <Text weight="medium" color="muted">
            #{idx + 1} {entry.userDisplayName ?? EVENT_LABELS.PARTICIPANT_FALLBACK}
          </Text>
          <Text size="sm" color="muted">
            {entry.points ?? 0} {EVENT_LABELS.POINTS_SUFFIX}
          </Text>
        </Row>
      ))}
    </Div>
  );
}
