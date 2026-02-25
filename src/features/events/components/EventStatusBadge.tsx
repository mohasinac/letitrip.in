"use client";

import { Badge } from "@/components";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("eventStatus");
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
