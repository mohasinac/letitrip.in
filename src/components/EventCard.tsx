"use client";

import { EventCard as PkgEventCard } from "@mohasinac/feat-events";
import type { EventCardProps as PkgEventCardProps } from "@mohasinac/feat-events";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import type { EventItem, EventType } from "@mohasinac/feat-events";

export type { EventItem, EventType };

type EventCardProps = Omit<PkgEventCardProps, "href" | "LinkComponent">;

/**
 * Locale-aware wrapper around @mohasinac/feat-events's EventCard.
 * Pre-configures the href from ROUTES and uses next-intl's Link.
 */
export function EventCard({ event, ...props }: EventCardProps) {
  return (
    <PkgEventCard
      event={event}
      href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)}
      LinkComponent={Link}
      {...props}
    />
  );
}
