"use client";

import Link from "next/link";
import { Alert } from "@/components";
import { ROUTES } from "@/constants";
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
      <div className="space-y-4">
        <Alert variant="info">{tEvents("loginToParticipate")}</Alert>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="inline-block px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          {tActions("login")}
        </Link>
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Complete the survey to participate. Entries are reviewed before being
        counted.
      </p>
      <Link
        href={ROUTES.PUBLIC.EVENT_PARTICIPATE(event.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
      >
        {tEvents("participate")}
      </Link>
    </div>
  );
}
