"use client";

import { Suspense } from "react";

/**
 * One event entry, as a linkable page.
 *
 * Not the modal mounted open — `RecordDetailModal` hard-renders `<Modal>`, so
 * that would be a backdrop over nothing. Follows the detail-page precedent
 * (`/admin/payouts/[id]/view`) and reuses `buildEventEntryDetailFields`, the
 * same builder the list's modal now uses.
 *
 * `formResponses` gets its own block rather than a definition row: it is the
 * survey/feedback submission being judged, and Root Cause #56's "acting blind"
 * shape was Approve/Reject offered on content nobody could read.
 */
import {
  Button,
  Code,
  Container,
  Div,
  Heading,
  PageLoader,
  Row,
  Section,
  Stack,
  Text,
  apiClient,
  ADMIN_ENDPOINTS,
  ROUTES,
  buildEventEntryDetailFields,
  type JsonValue,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";



function PageInner() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const back = String(ROUTES.ADMIN.ALL_EVENT_ENTRIES);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "event-entry", id],
    queryFn: async () => {
      const res = await apiClient.get(ADMIN_ENDPOINTS.ADMIN_EVENT_ENTRY_BY_ID(id));
      const payload = res as { data?: unknown };
      return (payload.data ?? res) as Parameters<typeof buildEventEntryDetailFields>[0];
    },
    enabled: Boolean(id),
  });

  if (isLoading) return <PageLoader />;

  if (isError || !data) {
    return (
      <Section>
        <Container>
          <Stack gap="md" padding="y-lg">
            <Heading level={1} size="lg">Entry not found</Heading>
            <Row><Button asChild variant="outline"><Link href={back}>Back to entries</Link></Button></Row>
          </Stack>
        </Container>
      </Section>
    );
  }

  // Typed as the document types it, not `unknown` — `RecordDetailModal`'s
  // `metadata` slot takes the same shape, so both surfaces agree.
  const responses = (data as { formResponses?: Record<string, JsonValue> }).formResponses;

  return (
    <Section>
      <Container>
        <Stack gap="lg" padding="y-lg">
          <Row justify="between" align="center" wrap gap="sm">
            <Heading level={1} size="lg">
              {data.userDisplayName || data.userEmail || "Entry"}
            </Heading>
            <Button asChild variant="outline"><Link href={back}>Back to entries</Link></Button>
          </Row>

          {data.pollComment ? <Text color="muted">{data.pollComment}</Text> : null}

          <Div surface="card" padding="lg" rounded="xl" border="default">
            <Stack gap="sm">
              {buildEventEntryDetailFields(data).map((row) => (
                <Row key={row.label} justify="between" gap="md" wrap>
                  <Text size="sm" color="muted">{row.label}</Text>
                  <Text size="sm" weight="medium">{row.value}</Text>
                </Row>
              ))}
            </Stack>
          </Div>

          {responses && Object.keys(responses).length > 0 ? (
            <Stack gap="sm">
              <Text size="sm" weight="semibold" color="muted">Submission</Text>
              <Code>{JSON.stringify(responses, null, 2)}</Code>
            </Stack>
          ) : null}
        </Stack>
      </Container>
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
