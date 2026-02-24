"use client";

import Link from "next/link";
import { Alert } from "@/components";
import { ROUTES, UI_LABELS } from "@/constants";
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

  if (!user) {
    return (
      <div className="space-y-4">
        <Alert variant="info">{UI_LABELS.EVENTS.LOGIN_TO_PARTICIPATE}</Alert>
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="inline-block px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          {UI_LABELS.ACTIONS.LOGIN}
        </Link>
      </div>
    );
  }

  if (userEntryStatus === "pending") {
    return <Alert variant="info">{UI_LABELS.EVENTS.REVIEW_PENDING}</Alert>;
  }
  if (userEntryStatus === "approved") {
    return <Alert variant="success">{UI_LABELS.EVENTS.ENTRY_APPROVED}</Alert>;
  }
  if (userEntryStatus === "flagged") {
    return <Alert variant="warning">{UI_LABELS.EVENTS.ENTRY_FLAGGED}</Alert>;
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
        {UI_LABELS.EVENTS.PARTICIPATE}
      </Link>
    </div>
  );
}
