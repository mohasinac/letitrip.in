"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  EmptyState,
  Row,
  Section,
  Modal,
  Textarea,
  Skeleton,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import { getAdminReports, updateAdminReport } from "@/lib/api/admin-client";
import { useEffect, useState } from "react";
import type { ReportDocument } from "@mohasinac/appkit";

export default function Page() {
  const [items, setItems] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminReports(API_ROUTES.ADMIN.REPORTS)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const action = async (id: string, status: ReportDocument["status"], resolution?: string) => {
    await updateAdminReport(API_ROUTES.ADMIN.REPORT_BY_ID(id), { status, resolution, resolvedAt: status === "actioned" || status === "dismissed" ? new Date() : undefined });
    load();
  };

  const closeActionModal = () => {
    setActionTargetId(null);
    setResolutionNote("");
  };

  const submitAction = async () => {
    if (!actionTargetId) return;
    setSubmitting(true);
    try {
      await action(actionTargetId, "actioned", resolutionNote);
      closeActionModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Reports</Heading>
          <Text color="muted">
            Buyer-submitted reports against listings, stores, and users.
          </Text>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : items.length === 0 ? (
            <EmptyState title="No open reports" description="All caught up." />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id} rounded="default" padding="md" border="default" align="start" justify="between">
                  <Stack gap="xs" className="flex-1">
                    <Text weight="medium">
                      {r.reason} · {r.entityType} · {r.entityId}
                    </Text>
                    <Text className="line-clamp-2" color="muted" size="xs">
                      {r.detail}
                    </Text>
                    <Text size="xs" color="muted">
                      by {r.reporterId} · {new Date(r.createdAt).toLocaleString()}
                    </Text>
                  </Stack>
                  <Row gap="sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => action(r.id, "under-review")}
                    >
                      Take
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActionTargetId(r.id)}
                    >
                      Action
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => action(r.id, "dismissed", "Dismissed")}
                    >
                      Dismiss
                    </Button>
                  </Row>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      <Modal
        isOpen={actionTargetId !== null}
        onClose={closeActionModal}
        title="Action report"
        size="sm"
        actions={
          <Row justify="end" gap="sm">
            <Button variant="ghost" onClick={closeActionModal} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitAction}
              disabled={submitting}
              isLoading={submitting}
            >
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
    </Section>
  );
}
