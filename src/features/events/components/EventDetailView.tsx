"use client";

import type { EventItem } from "@mohasinac/appkit/features/events";
import { useEvent as usePublicEvent } from "@mohasinac/appkit/features/events";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UI_LABELS, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import {
  Heading, Text, Button, Span, Spinner, Row, RichText, } from "@mohasinac/appkit/ui";
import { Card, EmptyState, MediaImage } from "@/components";
import { useMessage } from "@mohasinac/appkit/react";
import { EventDetailView as AppkitEventDetailView } from "@mohasinac/appkit/features/events";
import { getMediaUrl } from "@mohasinac/appkit/utils";
import { proseMirrorToHtml } from "@mohasinac/appkit/utils";
import { EventStatusBadge } from "./EventStatusBadge";
import { PollVotingSection } from "./PollVotingSection";
import { SurveyEventSection } from "./SurveyEventSection";
import { FeedbackEventSection } from "./FeedbackEventSection";
import { EventLeaderboard } from "./EventLeaderboard";
import { formatDate } from "@mohasinac/appkit/utils";

const { typography, themed } = THEME_CONSTANTS;

interface EventDetailViewProps {
  id: string;
  initialData?: EventItem;
}

export function EventDetailView({ id, initialData }: EventDetailViewProps) {
  const { event, isLoading } = usePublicEvent(id, { initialData });
  const { showError } = useMessage();
  const t = useTranslations("events");
  const [codeCopied, setCodeCopied] = useState(false);
  const coverImageUrl = getMediaUrl(event?.coverImage) || event?.coverImageUrl;

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      showError(ERROR_MESSAGES.GENERIC.TRY_AGAIN);
    }
  };

  return (
    <AppkitEventDetailView
      isLoading={isLoading}
      renderSkeleton={() => (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}
      renderNotFound={
        !event && !isLoading
          ? () => (
              <EmptyState
                title={t("notFound")}
                description={t("notFoundDesc")}
              />
            )
          : undefined
      }
      renderCoverImage={
        coverImageUrl
          ? () => (
              <div className="relative aspect-[21/9] overflow-hidden rounded-xl mb-4">
                <MediaImage
                  src={coverImageUrl}
                  alt={event?.title ?? "Event cover"}
                  size="hero"
                  priority
                />
              </div>
            )
          : undefined
      }
      renderHeader={
        event
          ? () => (
              <div>
                <Row gap="sm" className="mb-2">
                  <EventStatusBadge status={event.status} />
                </Row>
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
                <RichText
                  html={proseMirrorToHtml(event.description ?? "")}
                  copyableCode
                  className={`mt-3 text-sm ${themed.textSecondary}`}
                />
              </div>
            )
          : undefined
      }
      renderContent={
        event
          ? () => (
              <>
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
                    {event.type === "survey" && (
                      <SurveyEventSection event={event} />
                    )}
                    {event.type === "feedback" && event.feedbackConfig && (
                      <FeedbackEventSection
                        eventId={event.id}
                        feedbackConfig={event.feedbackConfig}
                      />
                    )}
                    {event.type === "sale" && event.saleConfig && (
                      <Text size="sm" variant="secondary">
                        {UI_LABELS.EVENTS.SALE_BANNER(
                          event.saleConfig.discountPercent,
                        )}
                      </Text>
                    )}
                    {event.type === "offer" && event.offerConfig && (
                      <Row gap="md">
                        <Row
                          gap="sm"
                          className="flex-1 min-w-0 rounded-lg border border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-2"
                        >
                          <Span className="font-mono font-bold tracking-widest text-primary text-base select-all">
                            {event.offerConfig.displayCode}
                          </Span>
                          <Text
                            size="xs"
                            variant="secondary"
                            className="flex-1 truncate"
                          >
                            {UI_LABELS.EVENTS.OFFER_BANNER(
                              event.offerConfig.displayCode,
                            )}
                          </Text>
                        </Row>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopyCode(event.offerConfig!.displayCode)
                          }
                          className="shrink-0"
                        >
                          {codeCopied
                            ? UI_LABELS.PROMOTIONS_PAGE.COPIED
                            : UI_LABELS.PROMOTIONS_PAGE.COPY_CODE}
                        </Button>
                      </Row>
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
              </>
            )
          : undefined
      }
      renderLeaderboard={
        event?.type === "survey" && event.surveyConfig?.hasLeaderboard
          ? () => (
              <Card className="p-6">
                <EventLeaderboard
                  eventId={event.id}
                  pointsLabel={event.surveyConfig?.pointsLabel}
                />
              </Card>
            )
          : undefined
      }
    />
  );
}

