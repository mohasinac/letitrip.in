import { getPublicEventById, Div, Heading, Text, ROUTES } from "@mohasinac/appkit";
import type { Metadata } from "next";
import Link from "next/link";
import { EventParticipateClient } from "./EventParticipateClient";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id).catch(() => null);
  return { title: event ? `Participate — ${event.title}` : "Event Not Found" };
}

export default async function Page({ params }: Props) {
  const { locale, id } = await params;
  const event = await getPublicEventById(id).catch(() => null);

  if (!event) {
    return (
      <Div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Event Not Available
        </Heading>
        <Text className="mt-2 text-zinc-500 dark:text-zinc-400">
          This event may have ended, closed, or does not exist.
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
    <Div className="mx-auto max-w-xl px-4 py-10">
      <EventParticipateClient event={event} />
    </Div>
  );
}
