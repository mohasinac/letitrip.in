"use client";

import { Badge } from "@/components";
import { UI_LABELS } from "@/constants";
import type { EventStatus } from "@/db/schema";

interface EventStatusBadgeProps {
  status: EventStatus;
}

const STATUS_VARIANT: Record<
  EventStatus,
  "success" | "warning" | "danger" | "secondary"
> = {
  active: "success",
  draft: "secondary",
  paused: "warning",
  ended: "danger",
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const label =
    UI_LABELS.EVENT_STATUS[
      status.toUpperCase() as keyof typeof UI_LABELS.EVENT_STATUS
    ];
  return <Badge variant={STATUS_VARIANT[status]}>{label ?? status}</Badge>;
}
