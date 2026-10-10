"use client";
import { readListResponse } from "@/lib/api/read-list-response";
import { normalizeError } from "@mohasinac/appkit/client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Alert,
  EmptyState,
  Row,
  Section,
  Skeleton,
  ACTIONS,
  ROUTES,
} from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminItemRequests, updateAdminItemRequest } from "@/lib/api/admin-client";
import {useEffect, useState, Suspense } from "react";
import type { ItemRequestDocument } from "@mohasinac/appkit/client";



function PageInner() {
  const [items, setItems] = useState<ItemRequestDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    // Cleared on every retry — a stale error would otherwise win the render
    // branch even after a successful reload.
    setLoadError(null);
    getAdminItemRequests(API_ROUTES.ADMIN.ITEM_REQUESTS)
      .then((r) => readListResponse<ItemRequestDocument>(r, "item requests"))
      .then(setItems)
      .catch((err) => setLoadError(normalizeError(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const action = async (id: string, status: ItemRequestDocument["status"]) => {
    await updateAdminItemRequest(API_ROUTES.ADMIN.ITEM_REQUEST_BY_ID(id), { status });
    load();
  };

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Item Requests · Approval Queue</Heading>
          <Text color="muted">
            Buyer requests awaiting approval before going live on the community board.
          </Text>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : loadError ? (
            // A FAILED request must not render the empty state. `errorResponse()`
            // is valid JSON with a non-2xx status, so `r.json()` resolved and
            // `?? []` produced an empty list — the page said "nothing here"
            // when it meant "the request failed". See readListResponse.
            <Alert variant="error" title="Couldn't load this list">
              {loadError} Refresh to retry.
            </Alert>
          ) : items.length === 0 ? (
            <EmptyState
              title="Queue empty"
              description="No item requests pending approval."
            />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id} rounded="default" padding="md" border="default" align="start" justify="between">
                  <Stack gap="xs" className="flex-1">
                    <Text weight="medium">{r.title}</Text>
                    <Text className="line-clamp-2" color="muted" size="xs">
                      {r.description}
                    </Text>
                    <Text size="xs" color="muted">
                      by {r.opDisplayName} · status: {r.status}
                    </Text>
                  </Stack>
                  <Row gap="sm">
                    <Link
                      href={String(ROUTES.ADMIN.ITEM_REQUEST_DETAIL(r.id))}
                      className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-primary)] hover:underline"
                    >
                      View
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => action(r.id, "open")}
                    >
                      {ACTIONS.ADMIN["approve-product"].label}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => action(r.id, "rejected")}
                    >
                      {ACTIONS.ADMIN["reject-product"].label}
                    </Button>
                  </Row>
                </Row>
              ))}
            </Stack>
          )}
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
