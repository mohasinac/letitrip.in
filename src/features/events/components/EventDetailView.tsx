"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Card, Spinner, EmptyState, Heading, Text } from "@/components";
import { EventStatusBadge } from "./EventStatusBadge";
import { PollVotingSection } from "./PollVotingSection";
import { SurveyEventSection } from "./SurveyEventSection";
import { FeedbackEventSection } from "./FeedbackEventSection";
import { EventLeaderboard } from "./EventLeaderboard";
import { formatDate } from "@/utils";
import type { EventItem } from "@mohasinac/feat-events";
import { useEvent as usePublicEvent } from "@mohasinac/feat-events";

const { spacing, typography } = THEME_CONSTANTS;

interface EventDetailViewProps {
  id: string;
  initialData?: EventItem;
}

export function EventDetailView({ id, initialData }: EventDetailViewProps) {
  const { event, isLoading } = usePublicEvent(id, { initialData });

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
        {(event.startsAt || event.endsAt) && (
          <Text size="sm" variant="secondary" className="mt-1">
            {event.startsAt && `Starts: ${formatDate(event.startsAt)}`}
            {event.startsAt && event.endsAt && " · "}
            {event.endsAt && `Ends: ${formatDate(event.endsAt)}`}
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
