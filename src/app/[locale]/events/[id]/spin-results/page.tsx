import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Heading, Row, Stack, Text } from "@mohasinac/appkit/ui";
import { EVENT_LABELS, EVENT_META, EVENT_TYPE } from "../_constants";
import { getEventCached, getSpinResultsCached } from "../_data";

export const revalidate = 0;

type RouteParams = { locale: string; id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  return {
    title: event
      ? `${EVENT_META.SPIN_RESULTS_TITLE(event.title ?? "")} ${EVENT_META.TITLE_SUFFIX}`
      : EVENT_META.NOT_FOUND_TITLE,
  };
}

/** Small, self-contained relative-time label — no need to pull in a shared formatter for one field on one page. */
function relativeTime(iso: string | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const diffSec = Math.max(0, Math.round(diffMs / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();
  // Only meaningful for spin_wheel events — matches the layout's tab gate.
  if (event.type !== EVENT_TYPE.SPIN_WHEEL) notFound();

  const results = await getSpinResultsCached(id);

  if (results.length === 0) {
    return (
      <Div className="text-center" paddingY="y-2xl" paddingX="x-lg" rounded="xl" border="default">
        <Text color="muted">{EVENT_LABELS.SPIN_RESULTS_EMPTY}</Text>
      </Div>
    );
  }

  return (
    <Stack gap="sm">
      <Heading level={2} size="lg" weight="semibold" color="primary">
        {EVENT_LABELS.SPIN_RESULTS_HEADING}
      </Heading>
      {results.map((entry) => (
        <Row
          key={entry.id}
          paddingY="y-xs"
          paddingX="x-md"
          align="center"
          justify="between"
          rounded="lg"
          border="default"
        >
          <Text weight="medium" color="muted">
            {entry.isGuest ? EVENT_LABELS.GUEST_FALLBACK : (entry.userDisplayName ?? EVENT_LABELS.PARTICIPANT_FALLBACK)}
          </Text>
          <Row gap="sm" align="center">
            <Text size="sm" weight="semibold" color="primary">
              {entry.spinPrizeTitle ?? "—"}
            </Text>
            <Text size="xs" color="muted">
              {relativeTime(entry.spinWonAt)}
            </Text>
          </Row>
        </Row>
      ))}
    </Stack>
  );
}
