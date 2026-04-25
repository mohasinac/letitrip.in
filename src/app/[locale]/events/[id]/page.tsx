import {
  EventDetailView,
  getPublicEventById,
  getEventLeaderboard,
  Div,
  Heading,
  Text,
  ROUTES,
} from "@mohasinac/appkit";
import type { Metadata } from "next";
import Link from "next/link";

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

  return (
    <EventDetailView
      renderHeader={() => (
        <Div className="space-y-2">
          <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {event.title}
          </Heading>
          {event.description ? (
            <Text className="text-zinc-600 dark:text-zinc-400">{event.description}</Text>
          ) : null}
        </Div>
      )}
      renderLeaderboard={
        leaderboard.length > 0
          ? () => (
              <Div className="space-y-2">
                <Heading level={2} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Leaderboard
                </Heading>
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <Div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-700"
                  >
                    <Text className="font-medium text-zinc-700 dark:text-zinc-300">
                      #{idx + 1} {entry.userDisplayName ?? "Participant"}
                    </Text>
                    <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                      {entry.points ?? 0} pts
                    </Text>
                  </Div>
                ))}
              </Div>
            )
          : undefined
      }
      renderParticipateAction={() => (
        <Link
          href={`/${locale}${String(ROUTES.PUBLIC.EVENT_PARTICIPATE(id))}`}
          className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Participate Now
        </Link>
      )}
    />
  );
}
