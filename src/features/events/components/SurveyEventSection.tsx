"use client";

import { Alert, Text, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing } = THEME_CONSTANTS;
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks";
import type { EventDocument } from "@/db/schema";

interface SurveyEventSectionProps {
  event: EventDocument;
  userEntryStatus?: "pending" | "approved" | "flagged" | null;
}

export function SurveyEventSection({
  event,
  userEntryStatus,
}: SurveyEventSectionProps) {
  const { user } = useAuth();
  const tEvents = useTranslations("events");
  const tActions = useTranslations("actions");

  if (!user) {
    return (
      <div className={spacing.stack}>
        <Alert variant="info">{tEvents("loginToParticipate")}</Alert>
        <TextLink
          href={ROUTES.AUTH.LOGIN}
          className="inline-block px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          {tActions("login")}
        </TextLink>
      </div>
    );
  }

  if (userEntryStatus === "pending") {
    return <Alert variant="info">{tEvents("reviewPending")}</Alert>;
  }
  if (userEntryStatus === "approved") {
    return <Alert variant="success">{tEvents("entryApproved")}</Alert>;
  }
  if (userEntryStatus === "flagged") {
    return <Alert variant="warning">{tEvents("entryFlagged")}</Alert>;
  }

  return (
    <div className={spacing.stack}>
      <Text size="sm" variant="secondary">
        Complete the survey to participate. Entries are reviewed before being
        counted.
      </Text>
      <TextLink
        href={ROUTES.PUBLIC.EVENT_PARTICIPATE(event.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
      >
        {tEvents("participate")}
      </TextLink>
    </div>
  );
}
