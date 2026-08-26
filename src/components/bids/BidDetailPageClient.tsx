"use client";

/**
 * The shared body of `/admin/bids/[id]/view`, `/store/bids/[id]/view` and
 * `/user/bids/[id]/view`.
 *
 * ## Why a page and not the modal
 *
 * All three lists open a `RecordDetailModal`, which hard-renders `<Modal>`.
 * Mounting that permanently open on a page means a backdrop over nothing —
 * unlike a drawer, which reads fine as a side panel. So these follow the
 * detail-page precedent instead (`/admin/payouts/[id]/view`): a plain
 * `<Stack>` of the same rows.
 *
 * ## The rows come from the SAME builder the modal uses
 *
 * `buildBidDetailFields(bid, viewer)` is what decides which fields a portal
 * may see — the bidder's identity is shown to seller and admin and withheld
 * from a buyer looking at their own bid. Re-listing the fields here would be a
 * second place that decision lives, and the first copy-paste that forgot
 * `viewer` would show one buyer another's name.
 */
import {
  Badge,
  Button,
  Container,
  Div,
  Heading,
  PageLoader,
  RecordStatusTimeline,
  Row,
  Section,
  Stack,
  Text,
  apiClient,
  buildBidDetailFields,
  bidStatusBadge,
  type BidDetailViewer,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const TONE_TO_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  error: "danger",
  info: "info",
  neutral: "default",
};

export function BidDetailPageClient({
  viewer,
  endpoint,
  backHref,
  backLabel,
}: {
  viewer: BidDetailViewer;
  /** Builds the portal's own single-bid URL — each has different scoping. */
  endpoint: (id: string) => string;
  backHref: string;
  backLabel: string;
}) {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bid-detail", viewer, id],
    queryFn: async () => {
      const res = await apiClient.get(endpoint(id));
      const payload = res as { data?: unknown };
      return (payload.data ?? res) as Parameters<typeof buildBidDetailFields>[0];
    },
    enabled: Boolean(id),
  });

  if (isLoading) return <PageLoader />;

  if (isError || !data) {
    return (
      <Section>
        <Container>
          <Stack gap="md" padding="y-lg">
            <Heading level={1} size="lg">Bid not found</Heading>
            <Text color="muted">
              It may have been cancelled, or it belongs to someone else.
            </Text>
            <Row>
              <Button asChild variant="outline"><Link href={backHref}>{backLabel}</Link></Button>
            </Row>
          </Stack>
        </Container>
      </Section>
    );
  }

  const badge = bidStatusBadge(data.status);
  const rows = buildBidDetailFields(data, viewer);
  const history = (data as { statusHistory?: never[] }).statusHistory;

  return (
    <Section>
      <Container>
        <Stack gap="lg" padding="y-lg">
          <Row justify="between" align="center" wrap gap="sm">
            <Stack gap="xs">
              <Heading level={1} size="lg">{data.productTitle || data.productId}</Heading>
              <Row gap="xs" align="center">
                <Badge variant={TONE_TO_VARIANT[badge.tone] ?? "default"}>{badge.label}</Badge>
              </Row>
            </Stack>
            <Button asChild variant="outline"><Link href={backHref}>{backLabel}</Link></Button>
          </Row>

          <Div surface="card" padding="lg" rounded="xl" border="default">
            <Stack gap="sm">
              {rows.map((row) => (
                <Row key={row.label} justify="between" gap="md" wrap>
                  <Text size="sm" color="muted">{row.label}</Text>
                  <Text size="sm" weight="medium">{row.value}</Text>
                </Row>
              ))}
            </Stack>
          </Div>

          {/*
            A bid moves through more states than any record a buyer owns —
            active → outbid → active → won → forfeited — and until W18 every
            one of those happened inside a settlement batch with nothing
            recording it. Absent history renders the empty label, never a step
            invented from `updatedAt`.
          */}
          <RecordStatusTimeline
            entries={history}
            truncatedCount={(data as { statusHistoryTruncated?: number }).statusHistoryTruncated}
          />
        </Stack>
      </Container>
    </Section>
  );
}
