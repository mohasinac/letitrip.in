"use client";

import { EventCard as PkgEventCard } from "@mohasinac/appkit/features/events";
import { Link } from "@/i18n/navigation";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import type { EventItem, EventType } from "@mohasinac/appkit/features/events";
import { Span } from "@mohasinac/appkit/ui";

export type { EventItem, EventType };

export interface EventCardProps {
  event: EventItem;
  className?: string;
  labels?: { participate?: string; viewResults?: string; entries?: string };
  onParticipate?: (event: EventItem) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

/**
 * Locale-aware wrapper around @mohasinac/feat-events's EventCard.
 * Handles navigation via next-intl Link.
 */
export function EventCard({
  event,
  selectable,
  selected,
  onSelect,
  ...props
}: EventCardProps) {
  const { dimensions } = THEME_CONSTANTS.card;
  return (
    <Link
      href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)}
      className="block relative"
      onClick={
        selectable && onSelect
          ? (e) => {
              e.preventDefault();
              onSelect(event.id, !selected);
            }
          : undefined
      }
    >
      {selectable && (
        <Span
          className={`absolute top-2 left-2 z-10 h-5 w-5 rounded border-2 inline-flex items-center justify-center pointer-events-none
            ${selected ? "bg-primary border-primary" : "bg-white/90 border-gray-300"}`}
          aria-hidden="true"
        >
          {selected && (
            <Span className="text-white text-xs leading-none">✓</Span>
          )}
        </Span>
      )}
      <PkgEventCard
        event={event}
        {...props}
        className={`${dimensions.minW} ${dimensions.minH} ${props.className ?? ""}`}
      />
    </Link>
  );
}
