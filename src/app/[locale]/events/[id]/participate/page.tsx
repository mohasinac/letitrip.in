import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";
import { EVENT_META, EVENT_TYPE } from "../_constants";
import { eventIsActive, toIsoOrUndefined } from "../_helpers";
import { getEventCached } from "../_data";
import { EventParticipateClient } from "./EventParticipateClient";

export const revalidate = 60;

type RouteParams = { locale: string; id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  return {
    title: event
      ? EVENT_META.PARTICIPATE_TITLE(event.title ?? "")
      : EVENT_META.NOT_FOUND_TITLE,
  };
}

export default async function Page({ params }: Props) {
  const { locale, id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();

  const eventType = (event.type as string | undefined) ?? "";
  const isActive = eventIsActive(event);

  // Polls are participated via the inline vote on the Overview tab.
  // Ended events have nothing to submit. Send users back to Overview.
  if (eventType === EVENT_TYPE.POLL || !isActive) {
    redirect({ href: String(ROUTES.PUBLIC.EVENT_DETAIL(id)), locale });
  }

  const hasLeaderboard =
    (event as { hasLeaderboard?: boolean }).hasLeaderboard === true;
  const pollConfig = (event as { pollConfig?: Parameters<typeof EventParticipateClient>[0]["event"]["pollConfig"] }).pollConfig;

  return (
    <EventParticipateClient
      event={{
        id,
        title: event.title ?? "",
        description:
          typeof event.description === "string" ? event.description : undefined,
        endsAt: toIsoOrUndefined(event.endsAt),
        type: eventType,
        pollConfig,
      }}
      hasLeaderboard={hasLeaderboard}
      embedded
    />
  );
}
