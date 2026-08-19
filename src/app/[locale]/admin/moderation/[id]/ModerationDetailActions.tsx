"use client";

// Reuses the exact PATCH call shape the Moderation list page's inline
// approve/reject controls already use (updateAdminModeration ->
// PATCH /api/admin/moderation/[id]), so both surfaces stay wire-compatible.
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, Modal, Row, Stack, Textarea, useToast, ACTIONS, normalizeError } from "@mohasinac/appkit/client";
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
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const review = async (nextStatus: "approved" | "rejected", reason?: string) => {
    setSubmitting(true);
    try {
      await updateAdminModeration(API_ROUTES.ADMIN.MODERATION_BY_ID(id), {
        status: nextStatus,
        reason,
      });
      showToast(nextStatus === "approved" ? "Media approved." : "Media rejected.", "success");
      setRejectOpen(false);
      router.refresh();
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
        <Button variant="primary" onClick={() => review("approved")} disabled={submitting} isLoading={submitting}>
          {ACTIONS.ADMIN["approve-product"].label}
        </Button>
        <Button variant="danger" onClick={() => setRejectOpen(true)} disabled={submitting}>
          {ACTIONS.ADMIN["reject-product"].label}
        </Button>
      </Row>

      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject media"
        size="sm"
        actions={
          <Row justify="end" gap="sm">
            <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => review("rejected", rejectReason)} disabled={submitting} isLoading={submitting}>
              {ACTIONS.ADMIN["reject-product"].label}
            </Button>
          </Row>
        }
      >
        <Stack gap="sm">
          <Textarea
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Why is this asset being rejected? The seller will see this note."
          />
        </Stack>
      </Modal>
    </>
  );
}
