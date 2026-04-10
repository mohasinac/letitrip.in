"use client";

import {
  EventStatusBadge as AppkitEventStatusBadge,
  type EventStatus,
} from "@mohasinac/appkit/features/events";

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return <AppkitEventStatusBadge status={status} />;
}
