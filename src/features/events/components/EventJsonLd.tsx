import { SITE_CONFIG } from "@/constants";
import { resolveDate } from "@/utils";
import type { EventDocument } from "@/db/schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letitrip.in";

interface Props {
  event: EventDocument;
  id: string;
}

/** Renders the Schema.org Event JSON-LD <script> block for SEO. */
export function EventJsonLd({ event, id }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: event.coverImageUrl ? [event.coverImageUrl] : undefined,
    startDate: resolveDate(event.startsAt)?.toISOString(),
    endDate: resolveDate(event.endsAt)?.toISOString(),
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
