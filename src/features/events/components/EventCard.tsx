"use client";

import Link from "next/link";
import { Card, Badge } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatRelativeTime } from "@/utils";
import { useTranslations } from "next-intl";
import { EventStatusBadge } from "./EventStatusBadge";
import type { EventDocument } from "@/db/schema";

interface EventCardProps {
  event: EventDocument;
}

const { themed, spacing, borderRadius, typography } = THEME_CONSTANTS;

export function EventCard({ event }: EventCardProps) {
  const t = useTranslations("events");
  const tTypes = useTranslations("eventTypes");

  function getCtaLabel(ev: EventDocument): string {
    if (ev.status === "ended") return t("viewResults");
    switch (ev.type) {
      case "sale":
        return "Shop Now";
      case "offer":
        return "Get Offer";
      case "poll":
        return t("vote");
      case "survey":
        return t("participate");
      case "feedback":
        return "Give Feedback";
      default:
        return t("participate");
    }
  }

  function getCtaHref(ev: EventDocument): string {
    if (ev.type === "sale") return ROUTES.PUBLIC.PRODUCTS;
    return ROUTES.PUBLIC.EVENT_DETAIL(ev.id);
  }

  const typeLabel = tTypes(event.type as Parameters<typeof tTypes>[0]);
  const endsAtDate = event.endsAt as unknown as Date | string | null;
  const endsIn = endsAtDate ? formatRelativeTime(endsAtDate) : null;

  return (
    <Card className={`flex flex-col overflow-hidden ${borderRadius.xl}`}>
      {/* Cover image or gradient placeholder */}
      {event.coverImageUrl ? (
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-3xl font-bold opacity-30">
            {typeLabel.charAt(0)}
          </span>
        </div>
      )}

      <div className={`flex flex-col flex-1 ${spacing.padding.md}`}>
        {/* Type + status */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="info">{typeLabel}</Badge>
          <EventStatusBadge status={event.status} />
        </div>

        {/* Title */}
        <h3
          className={`${typography.h4} ${themed.textPrimary} line-clamp-2 flex-1`}
        >
          {event.title}
        </h3>

        {/* Ends in */}
        {endsIn && event.status === "active" && (
          <p className={`text-xs mt-1 ${themed.textSecondary}`}>
            {t("endsIn")}: {endsIn}
          </p>
        )}

        {/* CTA */}
        <div className="mt-4">
          <Link
            href={getCtaHref(event)}
            className="block w-full text-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            {getCtaLabel(event)}
          </Link>
        </div>
      </div>
    </Card>
  );
}
