import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventRaffleWinnerView } from "@mohasinac/appkit";
import { EVENT_META } from "../_constants";
import { getEventCached } from "../_data";

export const revalidate = 60;

type RouteParams = { locale: string; id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventCached(id);
  return {
    title: event
      ? `${EVENT_META.WINNER_TITLE(event.title ?? "")} ${EVENT_META.TITLE_SUFFIX}`
      : EVENT_META.NOT_FOUND_TITLE,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const event = await getEventCached(id);
  if (!event) notFound();

  return <EventRaffleWinnerView event={event} />;
}
