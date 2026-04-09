import { notFound } from "next/navigation";
import { eventRepository } from "@/repositories";
import { EventDetailView, EventJsonLd } from "@/features/events";
import { SITE_CONFIG } from "@/constants";
import { dateToISOString } from "@/utils";
import type { Metadata } from "next";
import type { EventItem } from "@mohasinac/appkit/features/events";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letitrip.in";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await eventRepository.findById(id);
  if (!event) return {};
  const title = `${event.title} — ${SITE_CONFIG.brand.name}`;
  const description = event.description?.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.coverImageUrl ? [event.coverImageUrl] : undefined,
      type: "website",
    },
    alternates: { canonical: `${APP_URL}/events/${id}` },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await eventRepository.findById(id);
  if (!event) notFound();

  return (
    <>
      <EventJsonLd event={event} id={id} />
      <EventDetailView
        id={id}
        initialData={
          {
            ...event,
            startsAt: dateToISOString(event.startsAt),
            endsAt: dateToISOString(event.endsAt),
            createdAt: dateToISOString(event.createdAt),
            updatedAt: dateToISOString(event.updatedAt),
          } satisfies EventItem
        }
      />
    </>
  );
}
