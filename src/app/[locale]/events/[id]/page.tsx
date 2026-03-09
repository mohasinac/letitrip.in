import { notFound } from "next/navigation";
import { eventRepository } from "@/repositories";
import { EventDetailView } from "@/features/events";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

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

  const startDate = event.startsAt
    ? new Date(
        (event.startsAt as unknown as { toDate?: () => Date }).toDate?.() ??
          (event.startsAt as unknown as string),
      ).toISOString()
    : undefined;
  const endDate = event.endsAt
    ? new Date(
        (event.endsAt as unknown as { toDate?: () => Date }).toDate?.() ??
          (event.endsAt as unknown as string),
      ).toISOString()
    : undefined;

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
      <EventDetailView id={id} initialData={event} />
    </>
  );
}
