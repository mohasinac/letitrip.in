import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Div } from "@mohasinac/appkit/ui";
import { ROUTES } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { EVENT_LABELS, EVENT_META, EVENT_TAB } from "./_constants";
import { eventIsActive, metaDescriptionFromEvent } from "./_helpers";
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

  const e = event as unknown as Record<string, unknown>;
  const coverImage =
    typeof e.imageUrl === "string"
      ? e.imageUrl
      : typeof e.bannerImage === "string"
        ? e.bannerImage
        : undefined;

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

  const e = event as unknown as Record<string, unknown>;
  const coverImage =
    typeof e.imageUrl === "string"
      ? e.imageUrl
      : typeof e.bannerImage === "string"
        ? e.bannerImage
        : null;

  const eventType = (event.type as string | undefined) ?? "";
  const eventStatus = (event.status as string | undefined) ?? "";
  const totalEntries = (event as { stats?: { totalEntries?: number } }).stats?.totalEntries;
  const isActive = eventIsActive(event);

  const isPoll = eventType === "poll";
  const showParticipateTab = !isPoll && isActive;
  const showLeaderboardTab = leaderboard.length > 0;

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

  return (
    <Div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
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
      <Div className="pt-2">{children}</Div>
    </Div>
  );
}
