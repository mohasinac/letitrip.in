import type { ReactNode } from "react";
import type { FirestoreValue } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div, Stack } from "@mohasinac/appkit/ui";
import { ROUTES } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { EVENT_LABELS, EVENT_META, EVENT_TAB } from "./_constants";
import { eventIsActive, metaDescriptionFromEvent, resolveEventCoverImage } from "./_helpers";
import { getEventCached, getLeaderboardCached } from "./_data";
import { EventHeader } from "./EventHeader";
import { EventTabBar } from "./EventTabBar";

export const revalidate = 60;

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
  const [event, leaderboard] = await Promise.all([
    getEventCached(id),
    getLeaderboardCached(id),
  ]);
  if (!event) notFound();

  const coverImage = resolveEventCoverImage(event as unknown as Record<string, FirestoreValue>) ?? null;

  const eventType = (event.type as string | undefined) ?? "";
  const eventStatus = (event.status as string | undefined) ?? "";
  const totalEntries = (event as { stats?: { totalEntries?: number } }).stats?.totalEntries;
  const isActive = eventIsActive(event);

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
        title={event.title ?? ""}
        coverImage={coverImage}
        eventType={eventType}
        eventStatus={eventStatus}
        startsAt={event.startsAt}
        endsAt={event.endsAt}
        totalEntries={totalEntries}
      />
      <EventTabBar tabs={tabs} />
      <Div padding="t-xs">{children}</Div>
    </Stack>
  );
}
