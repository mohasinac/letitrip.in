import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Heading, Row, Stack, Text } from "@mohasinac/appkit/ui";
import { EVENT_LABELS, EVENT_META, EVENT_TYPE } from "../_constants";
import { getEventCached, getSpinResultsCached, getUserSpinResultsCached } from "../_data";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { safeRead } from "@mohasinac/appkit/server";

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

  /*
   * 🛑 TWO SECTIONS, and the distinction is the whole point of this page.
   *
   * "Your Spins" answers what did I win; "Last 10 Spin Results" is the public
   * masked feed of everyone's recent spins. The page used to be only the second
   * one while a checklist case asserted it was the first, and the failure mode
   * was quiet: read by someone who had never spun, it listed three strangers'
   * prizes with no empty state, because from the feed's point of view nothing
   * was empty. A visitor had no way to tell that none of those rows were theirs.
   *
   * The session read is free here — this route is already `revalidate = 0`, so
   * it was never cached — and it is wrapped in `safeRead` like the sibling
   * winner page's, so a session failure degrades to the signed-out prompt
   * rather than taking down a public page.
   */
  const viewer = await safeRead(() => getServerSessionUser(), {
    route: "/events/[id]/spin-results",
    key: "session.getServerSessionUser",
    fallback: null,
  });

  const [results, mySpins] = await Promise.all([
    getSpinResultsCached(id),
    viewer?.uid ? getUserSpinResultsCached(id, viewer.uid) : Promise.resolve([]),
  ]);

  const mySpinsSection = (
    <Stack gap="sm">
      <Heading level={2} size="lg" weight="semibold" color="primary">
        {EVENT_LABELS.MY_SPINS_HEADING}
      </Heading>
      {!viewer?.uid ? (
        <Div className="text-center" paddingY="y-lg" paddingX="x-lg" rounded="xl" border="default">
          <Text color="muted">{EVENT_LABELS.MY_SPINS_SIGNED_OUT}</Text>
        </Div>
      ) : mySpins.length === 0 ? (
        <Div className="text-center" paddingY="y-lg" paddingX="x-lg" rounded="xl" border="default">
          <Text color="muted">{EVENT_LABELS.MY_SPINS_EMPTY}</Text>
        </Div>
      ) : (
        mySpins.map((entry) => (
          <Row
            key={entry.id}
            paddingY="y-xs"
            paddingX="x-md"
            align="center"
            justify="between"
            rounded="lg"
            border="default"
          >
            <Text size="sm" weight="semibold" color="primary">
              {entry.spinPrizeTitle ?? "—"}
            </Text>
            <Text size="xs" color="muted">
              {relativeTime(entry.spinWonAt)}
            </Text>
          </Row>
        ))
      )}
    </Stack>
  );

  if (results.length === 0) {
    return (
      <Stack gap="lg">
        {mySpinsSection}
        <Div className="text-center" paddingY="y-2xl" paddingX="x-lg" rounded="xl" border="default">
          <Text color="muted">{EVENT_LABELS.SPIN_RESULTS_EMPTY}</Text>
        </Div>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {mySpinsSection}
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
    </Stack>
  );
}
