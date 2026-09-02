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
  Skeleton,
  ROUTES,
  ReviewDecisionModal,
  reportReviewFormSchema,
  type ReportReviewFormValues,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminReports, updateAdminReport } from "@/lib/api/admin-client";
import {useEffect, useState, Suspense } from "react";
import type { ReportDocument } from "@mohasinac/appkit/client";



function PageInner() {
  const [items, setItems] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [dismissTargetId, setDismissTargetId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAdminReports(API_ROUTES.ADMIN.REPORTS)
      .then((r) => r.json())
      .then((json) => setItems(json?.data?.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const action = async (id: string, body: ReportReviewFormValues) => {
    await updateAdminReport(API_ROUTES.ADMIN.REPORT_BY_ID(id), body);
    load();
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
                    <Link
                      href={String(ROUTES.ADMIN.REPORT_DETAIL(r.id))}
                      className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
                    >
                      View
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => action(r.id, { status: "under-review" })}
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
                      onClick={() => setDismissTargetId(r.id)}
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

      <ReviewDecisionModal
        isOpen={actionTargetId !== null}
        onClose={() => setActionTargetId(null)}
        title="Action report"
        schema={reportReviewFormSchema}
        status="actioned"
        noteField="resolution"
        noteLabel="Resolution note"
        noteHelp="Required — the reporter may see a summary."
        notePlaceholder="What did you do about this report?"
        confirmLabel="Confirm action"
        onConfirm={(values) => action(actionTargetId!, values)}
      />

      {/* Dismiss used to send a hardcoded "Dismissed" as its resolution, which
          is not a reason — it is the status restated. It now asks. */}
      <ReviewDecisionModal
        isOpen={dismissTargetId !== null}
        onClose={() => setDismissTargetId(null)}
        title="Dismiss report"
        schema={reportReviewFormSchema}
        status="dismissed"
        noteField="resolution"
        noteLabel="Why is this being dismissed?"
        noteHelp="Required — the reporter may see a summary."
        notePlaceholder="e.g. Reviewed the listing and found nothing that breaches policy."
        confirmLabel="Dismiss report"
        onConfirm={(values) => action(dismissTargetId!, values)}
      />
    </Section>
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
