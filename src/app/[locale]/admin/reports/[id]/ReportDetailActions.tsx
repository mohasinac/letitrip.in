"use client";

// Reuses the exact PATCH call shape the Reports list page's inline
// take/action/dismiss controls already use (updateAdminReport ->
// PATCH /api/admin/reports/[id]).
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Button,
  Row,
  useToast,
  normalizeError,
  ReviewDecisionModal,
  reportReviewFormSchema,
  type ReportReviewFormValues,
} from "@mohasinac/appkit/client";
import type { ReportDocument } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { updateAdminReport } from "@/lib/api/admin-client";

export interface ReportDetailActionsProps {
  id: string;
  status: ReportDocument["status"];
}

export function ReportDetailActions({ id, status }: ReportDetailActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [actionOpen, setActionOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // `resolvedAt` is NOT sent. It used to be `new Date()`, which JSON turns into
  // a string, and the old raw-spread route wrote that string into a field the
  // document declares as a Date. The server stamps it now.
  /**
   * THROWS on failure, on purpose — see the moderation twin. The action and
   * dismiss paths run inside `ReviewDecisionModal`, which needs the rejection
   * to reach it so it can stay open and keep the note.
   */
  const action = async (body: ReportReviewFormValues) => {
    await updateAdminReport(API_ROUTES.ADMIN.REPORT_BY_ID(id), body);
    showToast("Report updated.", "success");
    router.refresh();
  };

  /** "Take" opens no modal, so it reports for itself. */
  const take = async () => {
    setSubmitting(true);
    try {
      await action({ status: "under-review" });
    } catch (err) {
      void normalizeError(err);
      showToast("Failed to update report.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "actioned" || status === "dismissed") {
    return null;
  }

  return (
    <>
      <Row gap="sm">
        <Button
          variant="outline"
          onClick={take}
          disabled={submitting}
        >
          Take
        </Button>
        <Button variant="primary" onClick={() => setActionOpen(true)} disabled={submitting}>
          Action
        </Button>
        <Button variant="ghost" onClick={() => setDismissOpen(true)} disabled={submitting}>
          Dismiss
        </Button>
      </Row>

      <ReviewDecisionModal
        isOpen={actionOpen}
        onClose={() => setActionOpen(false)}
        title="Action report"
        schema={reportReviewFormSchema}
        status="actioned"
        noteField="resolution"
        noteLabel="Resolution note"
        noteHelp="Required — the reporter may see a summary."
        notePlaceholder="What did you do about this report?"
        confirmLabel="Confirm action"
        onConfirm={action}
      />

      {/* Dismiss used to send a hardcoded "Dismissed" as its resolution, which
          is the status restated rather than a reason. It now asks. */}
      <ReviewDecisionModal
        isOpen={dismissOpen}
        onClose={() => setDismissOpen(false)}
        title="Dismiss report"
        schema={reportReviewFormSchema}
        status="dismissed"
        noteField="resolution"
        noteLabel="Why is this being dismissed?"
        noteHelp="Required — the reporter may see a summary."
        notePlaceholder="e.g. Reviewed the listing and found nothing that breaches policy."
        confirmLabel="Dismiss report"
        onConfirm={action}
      />
    </>
  );
}
