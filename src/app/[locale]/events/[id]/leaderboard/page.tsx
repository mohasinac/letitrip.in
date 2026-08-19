import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Heading, Row, Stack, Text } from "@mohasinac/appkit/ui";
import { EVENT_LABELS, EVENT_META } from "../_constants";
import { getEventCached, getLeaderboardCached, getPollResultsCached } from "../_data";

export const revalidate = 0;

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
  const event = await getEventCached(id);
  if (!event) notFound();

  // Polls have no meaningful "who voted, ranked by points" leaderboard —
  // show a per-option vote tally instead. Every other event type (sale,
  // offer, survey, feedback, raffle, spin_wheel) keeps the points-ranked
  // list: survey in particular has its own explicit hasLeaderboard /
  // hasPointSystem config, so a points ranking is the correct, intentional
  // behavior there, not a bug.
  if (event.type === "poll") {
    const pollResults = await getPollResultsCached(id);

    if (pollResults.length === 0) {
      return (
        <Div className="text-center" paddingY="y-2xl" paddingX="x-lg" rounded="xl" border="default">
          <Text color="muted">
            {EVENT_LABELS.POLL_RESULTS_EMPTY}
          </Text>
        </Div>
      );
    }

    const totalVotes = pollResults.reduce((sum, r) => sum + r.count, 0);

    return (
      <Stack gap="sm">
        <Heading
          level={2} size="lg" weight="semibold" color="primary">
          {EVENT_LABELS.POLL_RESULTS_HEADING}
        </Heading>
        {pollResults.map((result) => (
          <Row
            key={result.optionId} paddingY="y-xs" paddingX="x-md" align="center" justify="between" rounded="lg" border="default"
          >
            <Text weight="medium" color="muted">
              {result.label}
            </Text>
            <Text size="sm" color="muted">
              {result.count} {EVENT_LABELS.VOTES_SUFFIX} ({result.percent}%)
            </Text>
          </Row>
        ))}
        <Text size="xs" color="faint">
          {totalVotes} {EVENT_LABELS.TOTAL_VOTES_SUFFIX}
        </Text>
      </Stack>
    );
  }

  const leaderboard = await getLeaderboardCached(id);

  if (leaderboard.length === 0) {
    return (
      <Div className="text-center" paddingY="y-2xl" paddingX="x-lg" rounded="xl" border="default">
        <Text color="muted">
          {EVENT_LABELS.LEADERBOARD_EMPTY}
        </Text>
      </Div>
    );
  }

  return (
    <Stack gap="sm">
      <Heading
        level={2} size="lg" weight="semibold" color="primary">
        {EVENT_LABELS.LEADERBOARD_HEADING}
      </Heading>
      {leaderboard.slice(0, EVENT_META.LEADERBOARD_VISIBLE_LIMIT).map((entry, idx) => (
        <Row
          key={entry.id} paddingY="y-xs" paddingX="x-md" align="center" justify="between" rounded="lg" border="default"
        >
          <Text weight="medium" color="muted">
            #{idx + 1} {entry.userDisplayName ?? EVENT_LABELS.PARTICIPANT_FALLBACK}
          </Text>
          <Text size="sm" color="muted">
            {entry.points ?? 0} {EVENT_LABELS.POINTS_SUFFIX}
          </Text>
        </Row>
      ))}
    </Stack>
  );
}
