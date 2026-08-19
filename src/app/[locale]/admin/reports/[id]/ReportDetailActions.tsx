"use client";

// Reuses the exact PATCH call shape the Reports list page's inline
// take/action/dismiss controls already use (updateAdminReport ->
// PATCH /api/admin/reports/[id]).
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, Modal, Row, Stack, Textarea, useToast, normalizeError } from "@mohasinac/appkit/client";
import type { ReportDocument } from "@mohasinac/appkit";
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
  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const action = async (nextStatus: ReportDocument["status"], resolution?: string) => {
    setSubmitting(true);
    try {
      await updateAdminReport(API_ROUTES.ADMIN.REPORT_BY_ID(id), {
        status: nextStatus,
        resolution,
        resolvedAt: nextStatus === "actioned" || nextStatus === "dismissed" ? new Date() : undefined,
      });
      showToast("Report updated.", "success");
      setActionOpen(false);
      router.refresh();
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
        <Button variant="outline" onClick={() => action("under-review")} disabled={submitting}>
          Take
        </Button>
        <Button variant="primary" onClick={() => setActionOpen(true)} disabled={submitting}>
          Action
        </Button>
        <Button variant="ghost" onClick={() => action("dismissed", "Dismissed")} disabled={submitting}>
          Dismiss
        </Button>
      </Row>

      <Modal
        isOpen={actionOpen}
        onClose={() => setActionOpen(false)}
        title="Action report"
        size="sm"
        actions={
          <Row justify="end" gap="sm">
            <Button variant="ghost" onClick={() => setActionOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => action("actioned", resolutionNote)} disabled={submitting} isLoading={submitting}>
              Confirm action
            </Button>
          </Row>
        }
      >
        <Stack gap="sm">
          <Textarea
            label="Resolution note"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            rows={4}
            placeholder="What did you do about this report? The reporter may see a summary."
          />
        </Stack>
      </Modal>
    </>
  );
}
