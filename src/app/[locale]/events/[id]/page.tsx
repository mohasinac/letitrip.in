import {
  getPublicEventById,
  getEventLeaderboard,
  Div,
  Heading,
  Text,
  ROUTES,
} from "@mohasinac/appkit";
import type { Metadata } from "next";
import Link from "next/link";
import { EventDetailClient } from "./EventDetailClient";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id).catch(() => null);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description?.slice(0, 155),
  };
}

const TYPE_BADGE: Record<string, string> = {
  sale:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  offer:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  poll:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  survey:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  feedback: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ended:  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  draft:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
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

  if (!event) {
    return (
      <Div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Event Not Found
        </Heading>
        <Text className="mt-2 text-zinc-500 dark:text-zinc-400">
          This event may have ended or does not exist.
        </Text>
        <Link
          href={`/${locale}${String(ROUTES.PUBLIC.EVENTS)}`}
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Browse Events
        </Link>
      </Div>
    );
  }

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
