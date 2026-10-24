import type { ReactNode } from "react";
import type { FirestoreValue } from "@mohasinac/appkit/schemas/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Stack } from "@mohasinac/appkit/ui";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { EVENT_LABELS, EVENT_META, EVENT_TAB } from "./_constants";
import { eventIsActive, metaDescriptionFromEvent, resolveEventCoverImage } from "./_helpers";
import { getEventCached, getLeaderboardCached } from "./_data";
import {
  getEventLikersCached,
  viewerHasLikedCached,
  safeRead,
} from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { EventHeader } from "./EventHeader";
import { EventTabBar } from "./EventTabBar";

export const revalidate = 600;

type RouteParams = { locale: string; id: string };
type Props = { children: ReactNode; params: Promise<RouteParams> };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) return { title: EVENT_META.NOT_FOUND_TITLE };

  const coverImage = resolveEventCoverImage(event as unknown as Record<string, FirestoreValue>);

  return _gm({
    title: `${event.title} ${EVENT_META.TITLE_SUFFIX}`,
    description: metaDescriptionFromEvent(
      typeof event.description === "string" ? event.description : "",
      event.title ?? "",
    ),
    image: coverImage,
    path: ROUTES.PUBLIC.EVENT_DETAIL(id),
    type: "article",
  });
}

export default async function Layout({ children, params }: Props) {
  const { id } = await params;
  /*
   * Likes join the SAME Promise.all. Rule #6 budgets ~3 sequential Firestore
   * round trips per request, so a fourth await in series would be the one
   * that breaks the budget — and the likers read is itself two bounded hops
   * (one indexed query, one batched profile lookup).
   *
   * 🛑 The viewer check is session-dependent, and this layout ALREADY reads
   * the session, so it costs no new dynamic API. It returns false with no
   * read at all for a signed-out visitor.
   */
  const viewer = await getServerSessionUser().catch(() => null);

  const [event, leaderboard, likersPage, viewerLiked] = await Promise.all([
    getEventCached(id),
    getLeaderboardCached(id),
    safeRead(() => getEventLikersCached(id), {
      route: "/events/[id]",
      key: "events.getEventLikers",
      fallback: { likers: [], hasMore: false },
    }),
    safeRead(() => viewerHasLikedCached(id, viewer?.uid), {
      route: "/events/[id]",
      key: "events.viewerHasLiked",
      fallback: false,
    }),
  ]);
  if (!event) notFound();

  const coverImage = resolveEventCoverImage(event as unknown as Record<string, FirestoreValue>) ?? null;

  const eventType = (event.type as string | undefined) ?? "";
  const storedStatus = (event.status as string | undefined) ?? "";
  // Optional field: every event written before likes existed has no value.
  const likeCount =
    (event as { stats?: { likeCount?: number } }).stats?.likeCount ?? 0;
  const isActive = eventIsActive(event);

  /*
   * 🛑 The badge must show the EFFECTIVE status, not the stored one.
   *
   * `eventIsActive` already gets this right — it requires `status === "active"`
   * AND `endsAt` in the future — and it is what gates the Participate tab two
   * lines down. The badge was rendering the raw `event.status`, so an event whose
   * stored status is still `active` but whose end date has passed announced
   * itself as **Active** while its own body said "This poll has ended" and no
   * Participate tab was offered. Measured on
   * /events/event-favourite-blader-poll: badge "Poll Active", header "End: 25
   * Sept 2026", read on 2026-09-29, with the ended copy rendering underneath.
   *
   * Nothing sweeps `status` to `ended` when `endsAt` passes, so the stored value
   * is not a reliable display value and deriving here is the fix rather than a
   * patch. `ended` is a real `EventStatus` member, so the badge colour map and
   * the status filter chips already understand it.
   *
   * Only the active-but-expired case is rewritten. `draft`, `paused`, `ended`
   * and `cancelled` are deliberate states and are passed through untouched — a
   * cancelled event must keep saying cancelled, not be relabelled by a date.
   */
  const eventStatus = storedStatus === "active" && !isActive ? "ended" : storedStatus;

  const isPoll = eventType === "poll";
  const isSpinWheel = eventType === "spin_wheel";
  const showParticipateTab = !isPoll && isActive;
  const showLeaderboardTab = leaderboard.length > 0;
  const showSpinResultsTab = isSpinWheel;

  const tabs: Array<{ value: string; label: string; href: string }> = [
    {
      value: EVENT_TAB.OVERVIEW,
      label: EVENT_LABELS.TAB_OVERVIEW,
      href: String(ROUTES.PUBLIC.EVENT_DETAIL(id)),
    },
  ];
  if (showParticipateTab) {
    tabs.push({
      value: EVENT_TAB.PARTICIPATE,
      label: EVENT_LABELS.TAB_PARTICIPATE,
      href: String(ROUTES.PUBLIC.EVENT_PARTICIPATE(id)),
    });
  }
  if (showLeaderboardTab) {
    tabs.push({
      value: EVENT_TAB.LEADERBOARD,
      label: EVENT_LABELS.TAB_LEADERBOARD,
      href: String(ROUTES.PUBLIC.EVENT_LEADERBOARD(id)),
    });
  }
  if (showSpinResultsTab) {
    tabs.push({
      value: EVENT_TAB.SPIN,
      label: EVENT_LABELS.TAB_SPIN,
      href: String(ROUTES.PUBLIC.EVENT_SPIN_RESULTS(id)),
    });
  }

  return (
    <Stack className="mx-auto max-w-3xl" gap="lg" paddingY="y-2xl" paddingX="x-md">
      <PageViewTracker entityType="event" entityId={id} url={String(ROUTES.PUBLIC.EVENT_DETAIL(id))} />
      <EventHeader
        eventId={id}
        title={event.title ?? ""}
        coverImage={coverImage}
        eventType={eventType}
        eventStatus={eventStatus}
        startsAt={event.startsAt}
        endsAt={event.endsAt}
        likeCount={likeCount}
        viewerLiked={viewerLiked}
        likers={likersPage.likers}
        likersHasMore={likersPage.hasMore}
      />
      <EventTabBar tabs={tabs} />
      <Div padding="t-xs">{children}</Div>
    </Stack>
  );
}
