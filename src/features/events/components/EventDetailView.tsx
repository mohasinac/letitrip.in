"use client";

import { useState } from "react";
import { UI_LABELS, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import {
  Card,
  Spinner,
  EmptyState,
  Heading,
  MediaImage,
  Text,
  Button,
  Span,
} from "@/components";
import { useMessage } from "@/hooks";
import { EventStatusBadge } from "./EventStatusBadge";
import { PollVotingSection } from "./PollVotingSection";
import { SurveyEventSection } from "./SurveyEventSection";
import { FeedbackEventSection } from "./FeedbackEventSection";
import { EventLeaderboard } from "./EventLeaderboard";
import { formatDate } from "@/utils";
import type { EventItem } from "@mohasinac/appkit/features/events";
import { useEvent as usePublicEvent } from "@mohasinac/appkit/features/events";

const { spacing, typography, themed } = THEME_CONSTANTS;

interface EventDetailViewProps {
  id: string;
  initialData?: EventItem;
}

export function EventDetailView({ id, initialData }: EventDetailViewProps) {
  const { event, isLoading } = usePublicEvent(id, { initialData });
  const { showError } = useMessage();
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      showError(ERROR_MESSAGES.GENERIC.TRY_AGAIN);
    }
  };

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
          <MediaImage
            src={event.coverImageUrl}
            alt={event.title}
            size="hero"
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
        <div
          className={`prose dark:prose-invert max-w-none mt-3 text-sm ${themed.textSecondary}`}
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
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
          {event.type === "sale" && event.saleConfig && (
            <Text size="sm" variant="secondary">
              {UI_LABELS.EVENTS.SALE_BANNER(event.saleConfig.discountPercent)}
            </Text>
          )}
          {event.type === "offer" && event.offerConfig && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-2">
                <Span className="font-mono font-bold tracking-widest text-primary text-base select-all">
                  {event.offerConfig.displayCode}
                </Span>
                <Text size="xs" variant="secondary" className="flex-1 truncate">
                  {UI_LABELS.EVENTS.OFFER_BANNER(event.offerConfig.displayCode)}
                </Text>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyCode(event.offerConfig!.displayCode)}
                className="shrink-0"
              >
                {codeCopied
                  ? UI_LABELS.PROMOTIONS_PAGE.COPIED
                  : UI_LABELS.PROMOTIONS_PAGE.COPY_CODE}
              </Button>
            </div>
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
