"use client";

import {
  DateDisplay,
  EventCard as LibEventCard,
  StatusBadge,
  type EventCardProps as LibEventCardProps,
} from "@letitrip/react-library";
import Link from "next/link";

export type EventCardProps = Omit<
  LibEventCardProps,
  "LinkComponent" | "DateDisplayComponent" | "StatusBadgeComponent"
>;

export function EventCard(props: EventCardProps) {
  return (
    <LibEventCard
      {...props}
      LinkComponent={Link}
      DateDisplayComponent={DateDisplay}
      StatusBadgeComponent={StatusBadge}
    />
  );
}
