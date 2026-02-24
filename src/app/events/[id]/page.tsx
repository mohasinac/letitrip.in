"use client";

import { use } from "react";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Card, Spinner, EmptyState } from "@/components";
import {
  EventStatusBadge,
  PollVotingSection,
  SurveyEventSection,
  FeedbackEventSection,
  EventLeaderboard,
} from "@/features/events";
import { formatDate } from "@/utils";
import type { EventDocument } from "@/db/schema";

interface Props {
  params: Promise<{ id: string }>;
}

const { themed, spacing, typography } = THEME_CONSTANTS;

export default function EventDetailPage({ params }: Props) {
  const { id } = use(params);

  const { data: event, isLoading } = useApiQuery<EventDocument>({
    queryKey: ["public-event", id],
    queryFn: () =>
      apiClient.get<EventDocument>(API_ENDPOINTS.EVENTS.DETAIL(id)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    return (
      <EmptyState
        title="Event not found"
        description="This event may have ended or been removed."
      />
    );
  }

  const startsAt = event.startsAt as unknown as string;
  const endsAt = event.endsAt as unknown as string;

  return (
    <div className={`max-w-3xl mx-auto ${spacing.stack}`}>
      {/* Header */}
      <div>
        {event.coverImageUrl && (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-56 object-cover rounded-xl mb-4"
          />
        )}
        <div className="flex items-center gap-2 mb-2">
          <EventStatusBadge status={event.status} />
        </div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {event.title}
        </h1>
        {(startsAt || endsAt) && (
          <p className={`text-sm mt-1 ${themed.textSecondary}`}>
            {startsAt && `Starts: ${formatDate(startsAt)}`}
            {startsAt && endsAt && " · "}
            {endsAt && `Ends: ${formatDate(endsAt)}`}
          </p>
        )}
        <p className={`mt-3 ${themed.textSecondary}`}>{event.description}</p>
      </div>

      {/* Type-specific participation section */}
      {event.status === "active" && (
        <Card className="p-6">
          <h2 className={`${typography.h4} ${themed.textPrimary} mb-4`}>
            {UI_LABELS.EVENTS.PARTICIPATE}
          </h2>
          {event.type === "poll" && event.pollConfig && (
            <PollVotingSection
              eventId={event.id}
              pollConfig={event.pollConfig}
            />
          )}
          {event.type === "survey" && <SurveyEventSection event={event} />}
          {event.type === "feedback" && event.feedbackConfig && (
            <FeedbackEventSection
              eventId={event.id}
              feedbackConfig={event.feedbackConfig}
            />
          )}
          {(event.type === "sale" || event.type === "offer") && (
            <p className={`text-sm ${themed.textSecondary}`}>
              {event.type === "sale" && event.saleConfig
                ? UI_LABELS.EVENTS.SALE_BANNER(event.saleConfig.discountPercent)
                : event.offerConfig
                  ? UI_LABELS.EVENTS.OFFER_BANNER(event.offerConfig.displayCode)
                  : null}
            </p>
          )}
        </Card>
      )}

      {event.status === "ended" && (
        <Card className="p-6">
          <p className={`text-sm font-medium ${themed.textSecondary}`}>
            {UI_LABELS.EVENTS.ENTRIES_CLOSED}
          </p>
        </Card>
      )}

      {/* Leaderboard — survey/giveaway only */}
      {event.type === "survey" && event.surveyConfig?.hasLeaderboard && (
        <Card className="p-6">
          <EventLeaderboard
            eventId={event.id}
            pointsLabel={event.surveyConfig.pointsLabel}
          />
        </Card>
      )}
    </div>
  );
}
