import {
  getPublicEventById,
  getEventLeaderboard,
} from "@mohasinac/appkit";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { EventDetailClient } from "./EventDetailClient";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id).catch(() => null);
  if (!event) return { title: "Event Not Found" };
  const e = event as unknown as Record<string, unknown>;
  const coverImage =
    typeof e.imageUrl === "string" ? e.imageUrl
    : typeof e.bannerImage === "string" ? e.bannerImage
    : undefined;
  return _gm({
    title: `${event.title} — LetiTrip Events`,
    description: (typeof event.description === "string" ? event.description : "").slice(0, 155) ||
      `Join ${event.title} on LetiTrip.`,
    image: coverImage,
    path: `/events/${id}`,
    type: "article",
  });
}

const TYPE_BADGE: Record<string, string> = {
  sale:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  offer:    "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  poll:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  survey:   "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  feedback: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  ended:  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  draft:  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function formatDate(value: unknown): string {
  if (!value) return "";
  try {
    return new Date(value as unknown as string).toLocaleDateString("en-IN", {
      dateStyle: "medium",
    });
  } catch {
    return String(value);
  }
}

export default async function Page({ params }: Props) {
  const { locale, id } = await params;
  const [event, leaderboard] = await Promise.all([
    getPublicEventById(id).catch(() => null),
    getEventLeaderboard(id).catch(() => []),
  ]);

  if (!event) notFound();

  const e = event as unknown as Record<string, unknown>;
  const coverImage =
    typeof e.imageUrl === "string" ? e.imageUrl
    : typeof e.bannerImage === "string" ? e.bannerImage
    : null;

  const eventType   = (event.type   as string | undefined) ?? "";
  const eventStatus = (event.status as string | undefined) ?? "";
  const typeBadgeCls   = TYPE_BADGE[eventType]   ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  const statusBadgeCls = STATUS_BADGE[eventStatus] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  const totalEntries = (event as any).stats?.totalEntries as number | undefined;

  const now    = Date.now();
  const endsAt = event.endsAt ? new Date(event.endsAt as unknown as string).getTime() : null;
  const isActive = eventStatus === "active" || (endsAt !== null && endsAt > now);

  const pollCfg = (event as any).pollConfig as {
    options: { id: string; label: string }[];
    allowMultiSelect: boolean;
    allowComment: boolean;
    requireLogin?: boolean;
  } | undefined;

  const safeLeaderboard = (leaderboard as any[]).map((entry) => ({
    id: String(entry.id ?? ""),
    userDisplayName: entry.userDisplayName ?? undefined,
    points: entry.points ?? undefined,
  }));

  return (
    <EventDetailClient
      eventId={id}
      locale={locale}
      coverImage={coverImage}
      eventType={eventType}
      eventStatus={eventStatus}
      typeBadgeCls={typeBadgeCls}
      statusBadgeCls={statusBadgeCls}
      totalEntries={totalEntries}
      isActive={isActive}
      title={event.title ?? ""}
      description={typeof event.description === "string" ? event.description : ""}
      startsAtFormatted={formatDate(event.startsAt)}
      endsAtFormatted={formatDate(event.endsAt)}
      pollConfig={pollCfg}
      leaderboard={safeLeaderboard}
    />
  );
}
