"use client";

// Reuses the exact PATCH call shape the Moderation list page's inline
// approve/reject controls already use (updateAdminModeration ->
// PATCH /api/admin/moderation/[id]), so both surfaces stay wire-compatible.
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Button,
  Row,
  useToast,
  ACTIONS,
  normalizeError,
  ReviewDecisionModal,
  moderationReviewFormSchema,
  type ModerationReviewFormValues,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { updateAdminModeration } from "@/lib/api/admin-client";

export interface ModerationDetailActionsProps {
  id: string;
  status: string;
}

export function ModerationDetailActions({ id, status }: ModerationDetailActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * THROWS on failure, on purpose. The reject path runs inside
   * `ReviewDecisionModal`, which catches, toasts and keeps itself open so the
   * typed reason is not lost — swallowing the error here would rob it of that
   * and leave the modal closing as though the rejection had saved.
   */
  const review = async (body: ModerationReviewFormValues) => {
    await updateAdminModeration(API_ROUTES.ADMIN.MODERATION_BY_ID(id), body);
    showToast(body.status === "approved" ? "Media approved." : "Media rejected.", "success");
    router.refresh();
  };

  /** The approve button has no modal to report for it, so it reports itself. */
  const approve = async () => {
    setSubmitting(true);
    try {
      await review({ status: "approved" });
    } catch (err) {
      void normalizeError(err);
      showToast("Failed to update moderation item.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status !== "pending") {
    return null;
  }

  return (
    <>
      <Row gap="sm">
        <Button
          variant="primary"
          onClick={approve}
          disabled={submitting}
          isLoading={submitting}
        >
          {ACTIONS.ADMIN["approve-product"].label}
        </Button>
        <Button variant="danger" onClick={() => setRejectOpen(true)} disabled={submitting}>
          {ACTIONS.ADMIN["reject-product"].label}
        </Button>
      </Row>

      <ReviewDecisionModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject media"
        schema={moderationReviewFormSchema}
        status="rejected"
        noteField="reason"
        noteLabel="Reason"
        noteHelp="Required — the seller will see this note."
        notePlaceholder="Why is this asset being rejected?"
        confirmLabel={ACTIONS.ADMIN["reject-product"].label}
        confirmVariant="danger"
        onConfirm={review}
      />
    </>
  );
}
