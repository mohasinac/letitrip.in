"use client";

import Link from "next/link";
import {
  EventCard as LibEventCard,
  type EventCardProps as LibEventCardProps,
  DateDisplay,
  StatusBadge,
} from "@letitrip/react-library";

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
