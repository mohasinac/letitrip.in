"use client";

import { use } from "react";
import { useApiQuery } from "@/hooks";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Card, Spinner, EmptyState, Heading, Text } from "@/components";
import {
  EventStatusBadge,
  PollVotingSection,
  SurveyEventSection,
  FeedbackEventSection,
  EventLeaderboard,
} from "@/features/events";
import { eventService } from "@/services";
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
    queryFn: () => eventService.getById(id),
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
        <Heading level={1} className={typography.h2}>
          {event.title}
        </Heading>
        {(startsAt || endsAt) && (
          <Text size="sm" variant="secondary" className="mt-1">
            {startsAt && `Starts: ${formatDate(startsAt)}`}
            {startsAt && endsAt && " · "}
            {endsAt && `Ends: ${formatDate(endsAt)}`}
          </Text>
        )}
        <Text variant="secondary" className="mt-3">
          {event.description}
        </Text>
      </div>

      {/* Type-specific participation section */}
      {event.status === "active" && (
        <Card className="p-6">
          <Heading level={2} className={`${typography.h4} mb-4`}>
            {UI_LABELS.EVENTS.PARTICIPATE}
          </Heading>
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
            <Text size="sm" variant="secondary">
              {event.type === "sale" && event.saleConfig
                ? UI_LABELS.EVENTS.SALE_BANNER(event.saleConfig.discountPercent)
                : event.offerConfig
                  ? UI_LABELS.EVENTS.OFFER_BANNER(event.offerConfig.displayCode)
                  : null}
            </Text>
          )}
        </Card>
      )}

      {event.status === "ended" && (
        <Card className="p-6">
          <Text size="sm" variant="secondary" weight="medium">
            {UI_LABELS.EVENTS.ENTRIES_CLOSED}
          </Text>
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
