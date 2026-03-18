import { notFound } from "next/navigation";
import { eventRepository } from "@/repositories";
import { EventDetailView } from "@/features/events";
import { SITE_CONFIG } from "@/constants";
import { resolveDate } from "@/utils";
import type { Metadata } from "next";
import type { EventItem } from "@mohasinac/feat-events";

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

  const startDate = resolveDate(event.startsAt)?.toISOString();
  const endDate = resolveDate(event.endsAt)?.toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: event.coverImageUrl ? [event.coverImageUrl] : undefined,
    startDate,
    endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: SITE_CONFIG.brand.name,
      url: APP_URL,
    },
    url: `${APP_URL}/events/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetailView
        id={id}
        initialData={
          {
            ...event,
            startsAt:
              event.startsAt instanceof Date
                ? event.startsAt.toISOString()
                : String(event.startsAt),
            endsAt:
              event.endsAt instanceof Date
                ? event.endsAt.toISOString()
                : String(event.endsAt),
            createdAt:
              event.createdAt instanceof Date
                ? event.createdAt.toISOString()
                : String(event.createdAt),
            updatedAt:
              event.updatedAt instanceof Date
                ? event.updatedAt.toISOString()
                : String(event.updatedAt),
          } satisfies EventItem
        }
      />
    </>
  );
}
